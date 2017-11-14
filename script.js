/*
Tim Kim
TechConnect - base64 image encoding conversion script
*/

function handleFileSelect(evt) {
  var files = evt.target.files; // FileList object

  // files is a FileList of File objects. List some properties.
  var output = [];
  for (var i = 0, f; f = files[i]; i++) {
    output.push('<p><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
    f.size, ' bytes, last modified: ',
    f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a','</p>');
  }
  document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
}

//Store encoded images into dictionary beforehand
function encodeImages(size) {
  if (size == imageFiles.files.length) return;
  
  //Recursively get base64 data
  getBase64(imageFiles.files[size], function(e) {
    addpair(imageFiles.files[size].name, e.target.result);
  })
  
  encodeImages(size+1);
}

//Synchronus line replacement for new HTML file
function mySyncFunction(allLines, size, prevCheck) {
  if (size == 0) return;
  
  var line = allLines[0];
  if (prevCheck) {
    //Grabbing image name (e.g. image001.gif)
    var endLine = line.split('/');
    endLine.shift();
    
    //String currently holds image001.gif"v:shapes ...
    var endString = endLine.join("/");
    
    //Split between name and rest of string
    var splitter = endString.split('\"');
    var imageNumber;
    var remainderLine;
    if (splitter != null) {
      imageNumber = splitter[0];
      splitter.shift();
      remainderLine = splitter.join('\"');
    }

    if (givevalue(imageNumber) != null) {
      newFile += ("src='" + givevalue(imageNumber) + "' " + remainderLine + "\n");
      prevCheck = false;
      allLines.shift();
      mySyncFunction(allLines, size - 1, prevCheck);
    } else {
      newFile += (line + "\n");
      allLines.shift();
      mySyncFunction(allLines, size - 1, prevCheck);
    }
    
  } else {
    if (line.includes("<img")) {
      newFile += (line + "\n");
      prevCheck = true;
      allLines.shift();
      mySyncFunction(allLines, size - 1, prevCheck);
    } else {
      newFile += (line + "\n");
      allLines.shift();
      mySyncFunction(allLines, size - 1, prevCheck);
    }
  }
}

//Read input HTML file and write to new converted file
function handleFiles(file, callback) {
  const reader = new FileReader();
  reader.onload = (event) => {
      file = event.target.result;
      allLines = file.split(/\r\n|\n/);

      prevCheck = false;
      //Recursively read line by line
      mySyncFunction(allLines, allLines.length, prevCheck);
      
      callback();
  };

  reader.onerror = (evt) => {
      alert(evt.target.error.name);
  };
  
  reader.readAsText(file);
}

//Convert image file into a base64 encoding
function getBase64(file, callback) {
 var reader = new FileReader();
 
 if (file) {
   reader.onload = callback;
   reader.readAsDataURL(file);
 }
 
 reader.onerror = function (error) {
   alert("Error: ", error);
 };
}




/**************************
          Main  
**************************/
document.getElementById("htmlFile").addEventListener('click', function(e) {
  e.target.files.length = 0;
})
document.getElementById('imageFiles').addEventListener('click', function(e) {
  e.target.files.length = 0;
});
document.getElementById('imageFiles').addEventListener('change', handleFileSelect, false);
  
var newFile = "";
var base64data = {};
var addpair = function (key, value) {
    base64data[key] = value;
}
var givevalue = function (key) {
    return base64data[key];
}
var allLines;
var prevCheck = false;

var submitButton = document.getElementById("submitButton");
submitButton.addEventListener("click", function() {
  //Get upladed HTML file and uploaded image files
  var htmlFile = document.getElementById("htmlFile").files[0];
  var imageFiles = document.getElementById("imageFiles").files;
  
  encodeImages(0);
  handleFiles(htmlFile, function() {
    download(newFile, document.getElementById("htmlFile").files[0].name, "text/html")
  });
  
  alert("Success!");
});
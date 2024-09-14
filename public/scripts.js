//#############################SHOW################################//
// function show(){
//     var codesection = document.getElementById("maincode");
//     var feed = document.getElementById("feed");
//     feed.style.display="none";
//     maincode.style.display ="block";
// }
// Counter to keep track of the number of clicks
let clickCount = 0;

// Function to show or hide the main code section
function handleClick() {
    clickCount++;
    const codesection = document.getElementById("maincode");
    const feed =document.getElementById("feed");
 
    // Toggle the visibility on odd clicks
    if (clickCount % 2 === 1) {
        codesection.style.display = "block"; // Show on odd clicks
        feed.style.display="none";
    } else {
        codesection.style.display = "none"; // Hide on even clicks
      
    }
}

// Add event listener to the button
function show(){
    handleClick()

}
// document.getElementById('show').addEventListener('click', handleClick);


//#############################DESIGN################################//
document.getElementById('fullscreen').addEventListener('click', function() {
    document.body.classList.toggle('fullscreen');
});

document.getElementById('theme-toggle').addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
});


//###############################################logic######################
var editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
    mode: "text/x-c++src",
    theme: "dracula",
    lineNumbers: true,
    autoCloseBrackets: true,
    matchBrackets: true,
});

var option = document.getElementById("inlineFormSelectPref");
option.addEventListener("change", function () {
    switch (option.value) {
        case "Java":
            editor.setOption("mode", "text/x-java");
            break;
        case "Python":
            editor.setOption("mode", "text/x-python");
            break;
        case "HTML":
            editor.setOption("mode", "text/html");
            break;
        default:
            editor.setOption("mode", "text/x-c++src");
    }
});

document.getElementById("run").addEventListener("click", async function () {
    var code = {
        code: editor.getValue(),
        input: document.getElementById("input").value,
        lang: option.value
    };
    
    try {
        var oData = await fetch("http://localhost:8000/compile", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(code)
        });

        var response = await oData.json();
        if (option.value === "HTML") {
            var iframe = document.createElement("iframe");
            iframe.style.width = "100%";
            iframe.style.height = "500px";
            document.body.appendChild(iframe);
            var doc = iframe.contentDocument || iframe.contentWindow.document;
            doc.open();
            doc.write(response.output);
            doc.close();
        } else {
            document.getElementById("output").value = response.output;
        }
    } catch (error) {
        document.getElementById("output").value = "Error: " + error;
    }
});
// ##############################CHECK##################
window.onload = function() {
    // Your JavaScript code here
    console.log("DOM fully loaded and script executed.");
  };
// #######################################SHARE#######################
        // JavaScript to handle the share button click event
     
var dbSupported=false;
var states=["new","in progress","done", "deleted"];
var note={text:"", state:0};
var db;
document.addEventListener('DOMContentLoaded', function(){ 
	if("indexedDB" in window) {
		dbSupported= true;
		var openRequest = indexedDB.open("misNotas",1);
		openRequest.onupgradeneeded = function(e) {
	        var thisDB = e.target.result; 
        	if(!thisDB.objectStoreNames.contains("notas")) {
	            thisDB.createObjectStore("notas",{autoIncrement:true});
    	    }
		}
		openRequest.onsuccess = function(e) {
        console.log("running onsuccess"); 
        db = e.target.result;
        read();
    	}

    	openRequest.onerror =  function(e){
            foreach( t in e)
            console.error(t);
    		alert('something went wrong while opening/creating database');
    	}

	}
});


function save(){
	//console.log("running save with db "+db);
	var transaction = db.transaction(["notas"],"readwrite");
    var store = transaction.objectStore("notas");
	note.text=document.getElementById("txtNote").value;
	note.state=1;
    //TODO: get position of note and update
	console.log("we are trying to add : "+note.text);
	var request = store.add(note);

	request.onerror = function(e) {
        console.log("Error",e.target.error.name);
        alert("Error saving text");
    }
    request.onsuccess = function(e) {
        console.log("Woot! Did it");
        document.getElementById("txtNote").value="";
        read();
    }
};

function read(){
	console.log("runnning read all ");
	var s = ''; 
    db.transaction(["notas"], "readonly").objectStore("notas").openCursor().onsuccess = function(e) {
        var cursor = e.target.result;
        if(cursor) {
            s += "<div class='post-it' draggable='true'> <input type='Button' id='btnDelete' onClick='deleteDiv("+cursor.key+")' class='closeBtn' value='X'/><p>";
            s+= cursor.value["text"]+"<br/>";
            s+="</p></div>";
            cursor.continue();
            //TODO get x, y values and paint
        }
        document.getElementById("storedNotes").innerHTML = s;
    } 

};

function onEnter()
{

        var keyPressed = event.keyCode || event.which;
        console.log("running onEnter "+keyPressed);
        if(keyPressed==13)
        {
            console.log('hit enter');
            keyPressed=null;
            save();
        }
        else
        {
            return false;
        }
};
    
function deleteDiv(a)
{
    //console.log('running delete: '+a);
    //alert('Deleting ');
    var transaction = db.transaction(["notas"],"readwrite");
    var store = transaction.objectStore("notas");
    var request = store.delete(a);
    request.onerror = function(e) {
        console.log("Error",e.target.error.name);
        alert("Error Deleting note");
    }
    request.onsuccess = function(e) {
        console.log("Woot! Did it");
        read();
    }
};

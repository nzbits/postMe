var dbSupported=false;
var states=["new","in progress","done", "deleted"];
var note={text:"", state:0};
var db;
document.addEventListener('DOMContentLoaded', function(){ 
	//alert("Hello putos");
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
    		alert('something is fucked up');
    	}

	}
});


function save(){
	//console.log("running save with db "+db);
	var transaction = db.transaction(["notas"],"readwrite");
    var store = transaction.objectStore("notas");

	note.text=document.getElementById("txtNote").value;
	note.state=1;
	console.log("we are trying to add : "+note.text);
	var request = store.add(note);
	request.onerror = function(e) {
        console.log("Error",e.target.error.name);
        //some type of error handler
    }
    request.onsuccess = function(e) {
        console.log("Woot! Did it");
        read();
    }
};

function read(){
	console.log("runnning read all ");
	var s = ''; 
    db.transaction(["notas"], "readonly").objectStore("notas").openCursor().onsuccess = function(e) {
        var cursor = e.target.result;
        if(cursor) {
            s += "<div class='post-it'><p>";
            //for(var field in cursor.value) {
            	//console.log("selector "+ field);
               //s+= field +"="+cursor.value[field]+"<br/>";
            //}
            s+= cursor.value["text"]+"<br/>";
            s+="</p></div>";
            cursor.continue();
        }
        document.getElementById("storedNotes").innerHTML = s;
    } 

}


    


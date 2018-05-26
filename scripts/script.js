var offset_data; //for drag
var movingKey;// chrome failed me :(
var dbSupported=false;
var states=["new","in progress","done", "deleted"];
var note={text:"", state:0};
var db;
var currentBg;
var backgrounds= ["img/chip.jpg","img/chess.jpg","img/chopping.jpg"];

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
    currentBg=0;
});

function changeBg(){
    var body = document.getElementById("myBody")
    if(currentBg+1==backgrounds.length) currentBg=0;
    else currentBg++;
    body.style.backgroundImage = "url('"+backgrounds[currentBg]+"')";
        
    }
    
    
    function save(){
	console.log("running save with db "+db);
	var transaction = db.transaction(["notas"],"readwrite");
    var store = transaction.objectStore("notas");
	note.text=document.getElementById("txtNote").value;
	note.state=1;
    note.top=0;
    note.left=0;
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
	 document.getElementById("storedNotes").innerHTML="";
    db.transaction(["notas"], "readonly").objectStore("notas").openCursor().onsuccess = function(e) {
        var cursor = e.target.result;
        if(cursor) {
            var s = '';
            s += "<div id='note_"+cursor.key+"' class='post-it' draggable='true' ondragstart='drag_start(event,"+cursor.key+")' > <input type='Button' id='btnDelete' onClick='deleteDiv("+cursor.key+")' class='closeBtn' value='X'/>"
            +"<p id=p_"+cursor.key
            +" ondblclick=\"this.contentEditable=true;this.className='inEdit';\" "
            +" onblur=\" this.contentEditable=false; this.className=''; update(" + cursor.key +");\""
            +" contenteditable='false' class='' "
            +" onkeyup=\"onEnterEdit("+cursor.key+")\">";
            s+= cursor.value["text"];
            s+="</p></div>"
            document.getElementById("storedNotes").innerHTML += s;
            var noteDiv = document.getElementById("note_"+cursor.key);
            noteDiv.style.left = cursor.value.left + 'px';
            noteDiv.style.top = cursor.value.top  + 'px';
            cursor.continue();
        }
        //TODO get x, y values and paint 187.245.238.21
        


    } 

};

function update(key,left,top){
    console.log("running update with key "+key );
    console.log("running update with left "+left );
    console.log("running update with top "+top );
    var transaction = db.transaction(["notas"],"readwrite");
    var store = transaction.objectStore("notas");    
    var noteRequest = store.get(key);
    noteRequest.onerror = function(e) {
        console.log("Error",e.target.error.name);
        alert("Error retrieving note");
    }
    noteRequest.onsuccess = function(e) {
        var note = noteRequest.result;
        console.log("found note :"+JSON.stringify(note)); 
        var p = ""+document.getElementById("p_"+key).innerHTML;       
        console.log("my text "+p+"/");
            note.text= p;
            if(left)
                note.left=left;
            if(top)
                note.top=top;
         var updateNoteRequest = store.put(note,key);
         updateNoteRequest.onsuccess = function(){
            console.log('update transaction:'+updateNoteRequest.transaction);
            read();
         };
         updateNoteRequest.onerror = function(){
            alert('Note could not be updated');
         };
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

function onEnterEdit(key)
{
      var keyPressed = event.keyCode || event.which;
        if(keyPressed==13)
        {
            this.contentEditable=false;
            this.className='';
            update(key);
            keyPressed=null;
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

function drag_start(event, key) {
    console.log("we are dragging!!!"+event);
    //console.log(document.getElementById("note_"+key));
    event.dataTransfer.setData("key", key);
    var style = window.getComputedStyle(event.target, null);
    offset_data = (parseInt(style.getPropertyValue("left"),10) - event.clientX) + ',' + (parseInt(style.getPropertyValue("top"),10) - event.clientY);
    movingKey = key;
    event.dataTransfer.setData("text/plain",offset_data);
    event.dataTransfer.setData("key",key);
    //var a = event.dataTransfer.getData("text/plain");
    //var b = event.dataTransfer.getData("key");
    //console.log(a);
    //console.log("ddd"+ movingKey);

} ;

function drop(event) { 
    var offset;
    var key;
    console.log("running drop");
    try {
        offset = event.dataTransfer.getData("text/plain").split(',');
        key = event.dataTransfer.getData("key");
    } 
    catch(e) {
        offset = offset_data;
        key = movingKey;
    } 
    key = movingKey;  
    console.log("key " ,key) ;    
    var top = event.clientY + parseInt(offset[1],10);
    var left = event.clientX + parseInt(offset[0],10);    
    update(key,left, top);
    event.preventDefault();
    return false;
} ;
function drag_over(event) { 
    var offset;
    var key;
    try {
        offset = event.dataTransfer.getData("text/plain").split(',');
        key = event.dataTransfer.getData("key");
    } 
    catch(e) {
        offset = offset_data.split(',');
        key = movingKey;
    }    
    key = movingKey;  
    console.log("key " ,key) ;
    var dm = document.getElementById('note_'+ key);
    dm.style.left = (event.clientX + parseInt(offset[0],10)) + 'px';
    dm.style.top = (event.clientY + parseInt(offset[1],10)) + 'px';
    event.preventDefault(); 
    return false; 
} 
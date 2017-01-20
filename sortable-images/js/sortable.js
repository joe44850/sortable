"use strict";

class Image {

    constructor(){
        this.isDragging = false;
        this.sourceElement = null;        
    }

    clone(el, cursor){
        let $Image = this;        
        let tempElement = el.cloneNode(true);
        tempElement.id = "tempElement";
        tempElement.style.position = "absolute";        
        tempElement.style.left = (cursor.clientX - 50)+"px";
        tempElement.style.top =  (cursor.clientY - 50)+"px";
        tempElement.style.opacity = ".5";        

        this.tempElement = tempElement;
        document.body.appendChild(tempElement); 
        this.move = true;        
        
        tempElement.onmousemove = $Image.drag.bind(this);
        tempElement.onmouseup = $Image.reposition.bind(this);
        tempElement.onmouseout = $Image.cancelDrag.bind(this);
    }

    drag(e){            
        if(this.move){
            let tempElement = document.getElementById('tempElement');
            tempElement.style.left = (e.clientX - 50)+"px";
            tempElement.style.top =  (e.clientY - 50)+"px";
        }
    }

    getHoverDiv(x, y){
        var element, elements = [];
        var old_visibility = [];
        while (true) {
            element = document.elementFromPoint(x, y);
            if (!element || element === document.documentElement) {
                break;
            }            
            elements.push(element);
            old_visibility.push(element.style.visibility);
            element.style.visibility = 'hidden'; // Temporarily hide the element (without changing the layout)
        }
        for (var k = 0; k < elements.length; k++) {
            elements[k].style.visibility = old_visibility[k];
        }
        elements.reverse();
        let retval = []; 
        for(let i=0; i<elements.length; i++){
            let el = elements[i];
            if(el.id && el.id.indexOf("image_")!=-1 && el.id != this.sourceElement.id){
                retval.push(el);
            }
        }       
        return retval[0];
    }

    reposition(e){ 
        let element = this.getHoverDiv(e.clientX, e.clientY);
        if(element){            
            element.parentNode.insertBefore(this.sourceElement, element.nextSibling);
        }           
        this.cancelDrag();       
    }

    cancelDrag(e){
        this.move = false;        
        let tempElement = document.getElementById('tempElement');
        tempElement.remove();
    }    

    static Create(img, index){        
        let el = document.createElement("div");
        el.id = "image_"+index;
        el.className = "sortable-image";
        el.innerHTML = "<img src='"+img+"' />";                
        return el;
    }
    
}

class ImageList {      

    constructor(){
        this.list = [];          
        this.oImage = null;   
    }

    create(div){
        this.divContainer = (div) || "image-container";
        this.oDivParent = document.getElementById(this.divContainer);
    }
    
    load(json){        
        return new Promise(function(resolve, reject){
            for(let i=0; i<json.length;i++){
                this.setOImage(json[i].image, i);
                this.appendImage();
                this.makeImageDraggable();                
                this.list.push(i);
            }  
            this.appendFooter();          
            return resolve(true);
        }.bind(this));
    }

    setOImage(image, index){
        this.oImage = Image.Create(image, index);
        this.index = index;
    }

    appendImage(){     
        this.oDivParent.appendChild(this.oImage);           
    }

    appendFooter(){
        let el = document.createElement("div");
        el.id = "footer";
        this.oDivParent.appendChild(el);
    }

    test(){
        alert("Yay");
    }

    makeImageDraggable(){
        var el = this.oImage;  
        var $Image = new Image(); 
        $Image.sourceElement = el;        
        el.onmousedown = (function(e){ 
            e.preventDefault();                
            $Image.clone(el, e);                        
        });        
             
    }


}

class Ajax{

    static fetch(url){        
        return new Promise(function(resolve, reject){
            let request = new XMLHttpRequest();
            request.open("GET", url);            
            request.onload = function(){                
                if(request.status === 200){ return resolve(request.response);}
                else{ reject(new Error(request.statusText));}
            };
            request.onerror = function(){                
                reject(new Error("Could not fetch the url: "+url));
            }
            request.send();
        })
    }
}

let $ImageList = new ImageList();
$ImageList.create();
Ajax.fetch("/js/images.json").then((json)=>{ return $ImageList.load(JSON.parse(json))});

window.addEventListener("load", function load(event){

    if (! sfomuseum.pdf.init()){
	return;
}

    var els = document.getElementsByClassName("pdf-document");
    var count = els.length;
    
    for (var i=0; i < count; i++) {

	var el = els[i];
	var id = el.getAttribute("data-id");
	var url = el.getAttribute("data-url");

	sfomuseum.pdf.render(id, url);
    }
});

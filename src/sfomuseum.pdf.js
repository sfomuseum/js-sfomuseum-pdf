var sfomuseum = sfomuseum || {};

sfomuseum.pdf = (function() {

    var pdfjsLib  = null;

    var scale = 1.75;

    var self = {

	'init': function(){

	    if (pdfjsLib){
		return true;
	    }
	    
	    pdfjsLib = window['pdfjs-dist/build/pdf'];
	    
	    if (! pdfjsLib){
		console.log("Unable to load pdf.js");
		return false;
	    }

	    var abs_root = document.body.getAttribute("data-abs-root-url");

	    pdfjsLib.GlobalWorkerOptions.workerSrc = abs_root + '/javascript/pdf.worker.js';
	    return true;
	},

	'render': function(id, url){
	    
	    var _pdf_canvas = "pdf-canvas-" + id;
	    var _pdf_page_num = "pdf-page-num-" + id
	    var _pdf_page_count = "pdf-page-count-" + id
	    var _pdf_prev = "pdf-prev-" + id;
	    var _pdf_next = "pdf-next-" + id;

	    var _pdf_zoom_in = "pdf-zoom-in-" + id;
	    var _pdf_zoom_out = "pdf-zoom-out-" + id;

	    var _pdf_cover = "pdf-cover-" + id
	    var _pdf_window = "pdf-window-" + id
	    
	    var pdfDoc = null;
	    var pageNum = 1;
	    var pageRendering = false;
	    var pageNumPending = null;

	    var canvas = document.getElementById(_pdf_canvas);
	    var ctx = canvas.getContext('2d');
	    
	    function renderPage(num, on_complete) {
		
		pageRendering = true;
		
		// Using promise to fetch the page
		
		pdfDoc.getPage(num).then(function(page) {

		    var viewport = page.getViewport({scale: scale});

		    canvas.height = viewport.height;
		    canvas.width = viewport.width;
		    
		    // Render PDF page into canvas context

		    var renderContext = {
			canvasContext: ctx,
			viewport: viewport
		    };
		    var renderTask = page.render(renderContext);
		    
		    // Wait for rendering to finish
		    
		    renderTask.promise.then(function() {

			pageRendering = false;

			if (pageNumPending !== null) {
			    renderPage(pageNumPending);
			    pageNumPending = null;
			}
			
			if (on_complete){
			    on_complete(num);
			}
		    });
		});

		var num_els = document.getElementsByClassName(_pdf_page_num);
		var count_els = num_els.length;

		for (var i =0; i < count_els; i++){
		    num_els[i].textContent = num;
		}
	    };
	    
	    function queueRenderPage(num) {
		if (pageRendering) {
		    pageNumPending = num;
		} else {
		    renderPage(num);
		}
	    }
	    
	    function onPrevPage() {
		
		var prev_page;

		if (pageNum <= 1) {
		    pageNum = pdfDoc.numPages;
		} else {
		    pageNum--;
		}
		
		queueRenderPage(pageNum);
	    }

	    function onNextPage() {

		if (pageNum >= pdfDoc.numPages) {
		    pageNum = 1;
		} else {
		    pageNum++;
		}

		queueRenderPage(pageNum);
	    }
	    
	    function onZoomIn(){
		scale = scale + 0.25;
		renderPage(pageNum);
	    };

	    function onZoomOut(){

		if (scale <= 0.25){
		    return;
		}

		scale = scale - 0.25;
		renderPage(pageNum);
	    };

	    var prev_els = document.getElementsByClassName(_pdf_prev);
	    var count_prev = prev_els.length;

	    for (var i=0; i < count_prev; i++){
		prev_els[i].addEventListener('click', onPrevPage);
	    }

	    var next_els = document.getElementsByClassName(_pdf_next);
	    var count_next = next_els.length;

	    for (var i=0; i < count_next; i++){
		next_els[i].addEventListener('click', onNextPage);
	    }	    

	    var zoomin_els = document.getElementsByClassName(_pdf_zoom_in);
	    var count_zoomin = zoomin_els.length;

	    for (var i=0; i < count_zoomin; i++){
		zoomin_els[i].addEventListener('click', onZoomIn);
	    }

	    var zoomout_els = document.getElementsByClassName(_pdf_zoom_out);
	    var count_zoomout = zoomout_els.length;

	    for (var i=0; i < count_zoomout; i++){
		zoomout_els[i].addEventListener('click', onZoomOut);
	    }	    
	    
	    
	    pdfjsLib.getDocument(url).promise.then(function(pdfDoc_) {	    
		
		var on_complete = function(num) {

		    var cover_el = document.getElementById(_pdf_cover);
		    var window_el = document.getElementById(_pdf_window);
		    
		    if (cover_el){
			cover_el.style.display = "none";
		    }
		    
		    if (window_el){
			window_el.style.display = "block";
		    }

		}
		
		pdfDoc = pdfDoc_;

		var pagecount_els = document.getElementsByClassName(_pdf_page_count);
		var pagecount_count = pagecount_els.length;

		for (var i=0; i < pagecount_count; i++){
		    pagecount_els[i].textContent = pdfDoc.numPages;
		}


		if (pdfDoc.numPages == 1){

		    var prev_els = document.getElementsByClassName(_pdf_prev);
		    var count_prev = prev_els.length;

		    var next_els = document.getElementsByClassName(_pdf_next);
		    var count_next = next_els.length;

		    for (var i = 0; i < count_prev; i++){
			prev_els[i].style.display = "none";
		    }

		    for (var i = 0; i < count_next; i++){
			next_els[i].style.display = "none";
		    }

		}

		renderPage(pageNum, on_complete);
	    });

	    return true;
	},
    };

    return self;
    
})();

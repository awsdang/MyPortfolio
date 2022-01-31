var txtFile = new XMLHttpRequest();
var allText = "file not found";
txtFile.onreadystatechange = function () {
	if (txtFile.readyState === XMLHttpRequest.DONE && txtFile.status == 200) {
		allText = txtFile.responseText;
		allText = allText.split("\n").join("<br>");
	}

	document.getElementById('text01').innerHTML = allText;
}
txtFile.open("GET", './text/01.txt', true);
txtFile.send(null);


var txtFile = new XMLHttpRequest();
var allText = "file not found";
txtFile.onreadystatechange = function () {
	if (txtFile.readyState === XMLHttpRequest.DONE && txtFile.status == 200) {
		allText = txtFile.responseText;
		allText = allText.split("\n").join("<br>");
	}

	document.getElementById('text02').innerHTML = allText;
}
txtFile.open("GET", './text/02.txt', true);
txtFile.send(null);


var txtFile = new XMLHttpRequest();
var allText = "file not found";
txtFile.onreadystatechange = function () {
	if (txtFile.readyState === XMLHttpRequest.DONE && txtFile.status == 200) {
		allText = txtFile.responseText;
		allText = allText.split("\n").join("<br>");
	}

	document.getElementById('text03').innerHTML = allText;
}
txtFile.open("GET", './text/03.txt', true);
txtFile.send(null);

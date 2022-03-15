var txtFile01 = new XMLHttpRequest();
var allText = "";
txtFile01.onreadystatechange = function () {
	if (txtFile01.readyState === XMLHttpRequest.DONE && txtFile01.status == 200) {
		allText = txtFile01.responseText.split("\n");
	}
	document.getElementById('prtype').innerHTML = allText[0];
	document.getElementById('prnumber').innerHTML = allText[1];
	document.getElementById('text01').innerHTML = allText[2];
	document.getElementById('text02').innerHTML = allText[3];
	document.getElementById('text03').innerHTML = allText[4];
	document.getElementById('text04').innerHTML = allText[5];
	document.getElementById('text05').innerHTML = allText[6];
	document.getElementById('text06').innerHTML = allText[7];
	document.getElementById('text07').innerHTML = allText[8];
	document.getElementById('text08').innerHTML = allText[9];
	document.getElementById('text09').innerHTML = allText[10];
	document.getElementById('text10').innerHTML = allText[11];
	document.getElementById('text11').innerHTML = allText[12];
	document.getElementById('text12').innerHTML = allText[13];
	
}
txtFile01.open("GET", 'https://awsdang.com/assets/work/mutaa/101/text/text.txt', true);
txtFile01.send(null);


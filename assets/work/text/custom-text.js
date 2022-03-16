var txtFile01 = new XMLHttpRequest();
var allText = "";
txtFile01.onreadystatechange = function () {
	if (txtFile01.readyState === XMLHttpRequest.DONE && txtFile01.status == 200) {
		allText = txtFile01.responseText.split("\n");
	}
	document.getElementById('voltext01').innerHTML = allText[0];
	document.getElementById('voltext02').innerHTML = allText[2];
	document.getElementById('academictext01').innerHTML = allText[4];
	document.getElementById('academictext02').innerHTML = allText[6];
	document.getElementById('academictext03').innerHTML = allText[8];
	document.getElementById('academictext04').innerHTML = allText[10];
	document.getElementById('academictext05').innerHTML = allText[12];
	document.getElementById('academictext06').innerHTML = allText[14];
	document.getElementById('alriyadtext01').innerHTML = allText[16];
	document.getElementById('alriyadtext02').innerHTML = allText[18];
	document.getElementById('alriyadtext03').innerHTML = allText[20];
	document.getElementById('alriyadtext04').innerHTML = allText[22];
	document.getElementById('freetext01').innerHTML = allText[24];
	document.getElementById('freetext02').innerHTML = allText[26];
	document.getElementById('freetext03').innerHTML = allText[28];
	document.getElementById('freetext04').innerHTML = allText[30];
	document.getElementById('freetext05').innerHTML = allText[32];
	document.getElementById('freetext06').innerHTML = allText[34];
	document.getElementById('freetext07').innerHTML = allText[36];
	document.getElementById('freetext08').innerHTML = allText[38];
	document.getElementById('mutaatext01').innerHTML = allText[40];
	document.getElementById('mutaatext02').innerHTML = allText[42];
	document.getElementById('mutaatext03').innerHTML = allText[44];
	document.getElementById('mutaatext04').innerHTML = allText[46];
	document.getElementById('mutaatext05').innerHTML = allText[48];
	document.getElementById('mutaatext06').innerHTML = allText[50];
	document.getElementById('mutaatext07').innerHTML = allText[52];
	document.getElementById('mutaatext08').innerHTML = allText[54];
	document.getElementById('mutaatext09').innerHTML = allText[56];
	document.getElementById('mutaatext10').innerHTML = allText[58];
	document.getElementById('mutaatext11').innerHTML = allText[60];
	document.getElementById('mutaatext12').innerHTML = allText[62];
	document.getElementById('mutaatext13').innerHTML = allText[64];
	document.getElementById('mutaatext14').innerHTML = allText[66];
	document.getElementById('mutaatext15').innerHTML = allText[68];
	document.getElementById('mutaatext16').innerHTML = allText[70];
	document.getElementById('mutaatext17').innerHTML = allText[72];
	document.getElementById('mutaatext18').innerHTML = allText[74];
	document.getElementById('mutaatext19').innerHTML = allText[76];
	document.getElementById('mutaatext20').innerHTML = allText[78];


}
txtFile01.open("GET", 'https://awsdang.com/assets/work/text/text.txt', true);
txtFile01.send(null);



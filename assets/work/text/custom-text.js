var txtFile01 = new XMLHttpRequest();
var allText = "";
txtFile01.onreadystatechange = function () {
	if (txtFile01.readyState === XMLHttpRequest.DONE && txtFile01.status == 200) {
		allText = txtFile01.responseText.split("\n");
	}
	document.getElementById('voltext01').innerHTML = allText[0];
	document.getElementById('volyear01').innerHTML = allText[1];
	document.getElementById('voltext02').innerHTML = allText[2];
	document.getElementById('volyear02').innerHTML = allText[3];
	document.getElementById('academictext01').innerHTML = allText[4];
	document.getElementById('academicyear01').innerHTML = allText[5];
	document.getElementById('academictext02').innerHTML = allText[6];
	document.getElementById('academicyear02').innerHTML = allText[7];
	document.getElementById('academictext03').innerHTML = allText[8];
	document.getElementById('academicyear03').innerHTML = allText[9];
	document.getElementById('academictext04').innerHTML = allText[10];
	document.getElementById('academicyear04').innerHTML = allText[11];
	document.getElementById('academictext05').innerHTML = allText[12];
	document.getElementById('academicyear05').innerHTML = allText[13];
	document.getElementById('academictext06').innerHTML = allText[14];
	document.getElementById('academicyear06').innerHTML = allText[15];
	document.getElementById('alriyadtext01').innerHTML = allText[16];
	document.getElementById('alriyadyear01').innerHTML = allText[17];
	document.getElementById('alriyadtext02').innerHTML = allText[18];
	document.getElementById('alriyadyear02').innerHTML = allText[19];
	document.getElementById('alriyadtext03').innerHTML = allText[20];
	document.getElementById('alriyadyear03').innerHTML = allText[21];
	document.getElementById('alriyadtext04').innerHTML = allText[22];
	document.getElementById('alriyadyear04').innerHTML = allText[23];
	document.getElementById('freetext01').innerHTML = allText[24];
	document.getElementById('freeyear01').innerHTML = allText[25];
	document.getElementById('freetext02').innerHTML = allText[26];
	document.getElementById('freeyear02').innerHTML = allText[27];
	document.getElementById('freetext03').innerHTML = allText[28];
	document.getElementById('freeyear03').innerHTML = allText[29];
	document.getElementById('freetext04').innerHTML = allText[30];
	document.getElementById('freeyear04').innerHTML = allText[31];
	document.getElementById('freetext05').innerHTML = allText[32];
	document.getElementById('freeyear05').innerHTML = allText[33];
	document.getElementById('freetext06').innerHTML = allText[34];
	document.getElementById('freeyear06').innerHTML = allText[35];
	document.getElementById('freetext07').innerHTML = allText[36];
	document.getElementById('freeyear07').innerHTML = allText[37];
	document.getElementById('freetext08').innerHTML = allText[38];
	document.getElementById('freeyear08').innerHTML = allText[39];
	
}
txtFile01.open("GET", 'https://awsdang.com/assets/work/text/text.txt', true);
txtFile01.send(null);





Highcharts.chart('me', {
	chart: {
	  type: 'packedbubble',
	  height: '180%',
	  styledMode: true,
	},
	title: {
	  text: ''
	},
	tooltip: {
	  enabled: false,
	  useHTML: false,
	  pointFormat: '<b>{point.name}:</b> {point.value}</sub>'
	},
	plotOptions: {
	  packedbubble: {
		minSize: '25%',
		maxSize: '200%',
		zMin: 0,
		zMax: 2000,
		layoutAlgorithm: {
		  splitSeries: false,
		  gravitationalConstant: 0.001
		},
		dataLabels: {
		  enabled: true,
		  format: '{point.name}',
		  filter: {
			property: 'y',
			operator: '>',
			value: 25,
			
		  },
		}
	  }
	},
	series: [{
	  name: 'BIM Applications',
	  data: [{
		  name: 'Revit',
		  value: 2000,
		  
		}, {
		  name: 'ArchiCAD',
		  value: 48,
		},
		{
		  name: "Solibri",
		  value: 92,
		},
		{
		  name: "BCF Manager",
		  value: 111,
		},
		{
		  name: "SimpleBIM",
		  value: 158.1,
		},]		, color: "#ff014f",
	}, {
	  name: 'CAD Applications',
	  data: [{
		  name: "AutoCAD",
		  value: 220,
		},
		{
		  name: "SketchUP",
		  value: 440,
		},
		{
		  name: "3DsMax",
		  value: 600,
		},
		{
			name: "Rhino",
			value: 130.1,
		  },
	  ], color: "#f7306c",
	}, {
	  name: 'Visualization Applications',
	  data: [{
		  name: "V-Ray",
		  value: 209.4,
		},
		{
		  name: "Corona Renderer",
		  value: 740.1,
		},
		{
		  name: "Lumion",
		  value: 980.1,
		},
		{
		  name: "Unreal Engine",
		  value: 90,
		}
	  ], color: "#c41247",
	}, {
	  name: 'Visual Scripting Applications',
	  data: [{
		  name: "Dynamo",
		  value: 650,
		},
		{
		  name: "Grasshopper",
		  value: 180,
		},
	  ], color: "#c7486e",
	}, {
	  name: 'Construction Management',
	  data: [{
		  name: "Naviswroks",
		  value: 300,
		},
		{
		  name: "Bexel Manager",
		  value: 110,
		},
	  ], color: "#a52f54",
	}, {
	  name: 'Graphic Applications',
	  data: [{
		  name: "Photoshop",
		  value: 830
		},
		{
		  name: "Illustrator",
		  value: 540
		},
		{
		  name: "InDesign",
		  value: 210
		}
	  ], color: "#ee5d88",
	}, {
		name: 'Video Editing Applications',
		data: [{
			name: "Premiere",
			value: 610
		  }
		], color: "#5a1228",
	  }, {
		name: 'Microsoft Office',
		data: [{
			name: "MS Word",
			value: 450
		  },
		  {
			name: "MS Excel",
			value: 320
		  },
		  {
			name: "MS PowerPoint",
			value: 610
		  }
		], color: "#a51641",
	  }, {
		name: 'Others',
		data: [{
			name: "PowerBI",
			value: 170
		  },
		  {
			name: "Python",
			value: 310
		  },
		  {
			name: "Project Refinery",
			value: 270
		  }
		], color: "#c5003b",
	  }

]
  });
  

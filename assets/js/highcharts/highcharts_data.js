Highcharts.chart('container', {


    chart: {
        spacingTop: 3,
        spacingRight: 3,
        spacingBottom: 3,
        spacingLeft: 3,
        margin: 0,
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
    series: [{
        styledMode: true,
        name: 'Software Skills',
        type: "treemap",
        layoutAlgorithm: 'squarified',

        levels: [{
                level: 1,
                layoutAlgorithm: 'squarified',
                dataLabels: {
                    enabled: true,
                    align: 'left',
                    verticalAlign: 'top',
                    style: {
                        fontSize: '15px',
                        fontWeight: 'bold',
                    },
                }
            },
            {
                level: 2,
                layoutAlgorithm: 'squarified',
                dataLabels: {
                    enabled: true,
                    align: 'center',
                    style: {
                        fontSize: '15px',
                        fontWeight: 'bold',
                    },
                }
            }
        ],

        data: [{
                id: 'A',
                name: 'BIM Applications',
                className: 'classA'
            },
            {
                id: 'B',
                name: 'CAD Applications',
                className: 'classB'
            },
            {
                id: 'C',
                name: 'Visualization Applications',
                className: 'classC'
            },
            {
                id: 'D',
                name: 'Visual Scripting Applications',
                className: 'classD'
            },
            {
                id: 'E',
                name: 'Construction Management',
                className: 'classE'
            },
            {
                id: 'F',
                name: 'Graphic Applications',
                className: 'classF'
            },
            {
                id: 'G',
                name: 'Video Editing Applications',
                className: 'classG'
            },
            {
                id: 'H',
                name: 'Microsoft Office',
                className: 'classH'
            },
            {
                id: 'I',
                name: 'Others',
                className: 'classI'
            },
            {
                name: 'Revit',
                parent: 'A',
                value: 15,
                className: 'classA'
            },
            {
                name: 'ArchiCAD',
                parent: 'A',
                value: 1.5,
                className: 'classA'
            },
            {
                name: 'Solibri',
                parent: 'A',
                value: 2.5,
                className: 'classA'
            },
            {
                name: 'BCFManager',
                parent: 'A',
                value: 3,
                className: 'classA'
            },
            {
                name: 'SimpleBIM',
                parent: 'A',
                value: 2,
                className: 'classA'
            },
            {
                name: 'AutoCAD',
                parent: 'B',
                value: 2.5,
                className: 'classB'
            },
            {
                name: 'SketchUP',
                parent: 'B',
                value: 4.5,
                className: 'classB'
            },
            {
                name: '3DsMAX',
                parent: 'B',
                value: 7,
                className: 'classB'
            },
            {
                name: 'Rhino',
                parent: 'B',
                value: 2,
                className: 'classB'
            },
            {
                name: 'V-Ray',
                parent: 'C',
                value: 3,
                className: 'classC'
            },
            {
                name: 'CoronaRenderer',
                parent: 'C',
                value: 5,
                className: 'classC'
            },
            {
                name: 'Lumion',
                parent: 'C',
                value: 7,
                className: 'classC'
            },
            {
                name: 'UnrealEngine',
                parent: 'C',
                value: 3,
                className: 'classC'
            },
            {
                name: 'Dynamo',
                parent: 'D',
                value: 6,
                className: 'classD'
            },
            {
                name: 'Grasshopper',
                parent: 'D',
                value: 2,
                className: 'classD'
            },
            {
                name: 'NavisWorks',
                parent: 'E',
                value: 4,
                className: 'classE'
            },
            {
                name: 'BexelManager',
                parent: 'E',
                value: 2,
                className: 'classE'
            },
            {
                name: 'Photoshop',
                parent: 'F',
                value: 7.06924452772336,
                className: 'classF'
            },
            {
                name: 'Illustrator',
                parent: 'F',
                value: 4.60778468614258,
                className: 'classF'
            },
            {
                name: 'InDesign',
                parent: 'F',
                value: 1.8311898475428,
                className: 'classF'
            },
            {
                name: 'Premiere',
                parent: 'G',
                value: 5.40839792181245,
                className: 'classG'
            },
            {
                name: 'MSWord',
                parent: 'H',
                value: 3.98603185418619,
                className: 'classH'
            },
            {
                name: 'MSExcel',
                parent: 'H',
                value: 2.93842091815007,
                className: 'classH'
            },
            {
                name: 'MSPowerPoint',
                parent: 'H',
                value: 5.22953751809897,
                className: 'classH'
            },
            {
                name: 'MSProjects',
                parent: 'H',
                value: 2.41887403117281,
                className: 'classH'
            },
            {
                name: 'MSPowerBI',
                parent: 'I',
                value: 2,
                className: 'classI'
            },
            {
                name: 'Python',
                parent: 'I',
                value: 3,
                className: 'classI'
            },
            {
                name: 'ProjectRefinery',
                parent: 'D',
                value: 3,
                className: 'classD'
            },
        ],

    }, ],
});
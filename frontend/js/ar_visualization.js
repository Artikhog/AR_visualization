let sended_positions = 0
let is_sended = false
var canvas = document.getElementById('ar_visualization')
var ctx = canvas.getContext('2d')
var stage = new createjs.Stage(canvas);
add_ticker(stage, 60);
var points = []
const serverUrl = 'http://10.10.33.11:5000/'
const getUrl = 'http://10.10.33.11:5000/?points=1'
canvas.addEventListener('click', sendMousePos)

// var point_shape = new createjs.Shape();
// point_shape.graphics.beginFill("black")
//     .drawRect(1, 1, 500, 500);
// stage.addChild(point_shape)


// function sendMousePos(event) {
//     if (sended_positions < 2) {
//         console.log(event.clientX - 10, event.clientY - 10)
//         points.push([event.clientX - 10, event.clientY - 10])
//         sended_positions++
//     }
//     else if (!is_sended) {
//         $.ajax({
//             url: 'http://172.20.10.3:8000/artem',
//             // url: 'http://172.20.10.2:5000/',
//             method: 'post',
//
//             dataType: 'json',
//             data: JSON.stringify({points: points, calibrate: 1}),
//             success: function (data) {
//                 console.log(data);
//             }
//         })
//         is_sended = true
//         console.log('send')
//     }
// }

function sendMousePos(event) {
    if (sended_positions < 6) {
        console.log(event.clientX - 10, event.clientY - 10)
        points.push([event.clientX - 10, event.clientY - 10])
        sended_positions++
        var point_shape = new createjs.Shape();
        point_shape.graphics.beginFill("black")
            .drawRect((event.clientX - 10) / 6.5, (event.clientY - 10) / 6.5, 5, 5);
        stage.addChild(point_shape)
    }
    else if (!is_sended) {
        fetch(serverUrl, {
            method: "POST",
            mode: 'no-cors',
            // headers: {
            //     'Access-Control-Allow-Origin' : '*'
            // },
            body: JSON.stringify({
                points: points,
                calibrate: 1
            })
        })
            .then( (response) => {
                console.log('set interval')
                setInterval(function () {
                    get_coordinates(stage);
                }, 400);
            });
        is_sended = true
        console.log('send')
    }
}

function get_coordinates(stage) {
    fetch(getUrl).then(response =>
        response.json().then(data => ({
                data: data,
                status: response.status
            })
        ).then(res => {
            // stage.removeAllChildren()
            var new_points = res.data.data
            console.log(new_points)
            for (let i = 0; i < 36; i++) {
                let point = new_points[i]
                console.log(point)
                var point_shape = new createjs.Shape();
                point_shape.graphics.beginFill("blue")
                    .drawRect(point[0] / 6.5, -point[1] / 6.5, 5, 5);
                stage.addChild(point_shape)
            }
        }).catch(function (e) {
            console.log(e)
        }));
}


function add_ticker(stage, framerate = 60) {
    createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
    createjs.Ticker.framerate = framerate;
    createjs.Ticker.addEventListener("tick", stage);
}
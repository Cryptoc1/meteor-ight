var width = window.innerWidth,
    height = window.innerHeight;
var pts = [];

function Landing(x, y, w, h, mass, name, year, lat, long) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.mass = mass;
    this.name = name;
    this.year = year;
    this.lat = lat;
    this.long = long;
}

window.onload = function () {
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    ctx.canvas.width = width;
    ctx.canvas.height = height;
    var img = new Image();
    img.onload = function () {
        ctx.drawImage(img, 0, 0, width, height);
        (function get(offset) {
            var limit = 1000;
            fetch('https://data.nasa.gov/resource/gh4g-9sfh.json?$order=name&$limit=' + limit + '&$offset=' + offset).then(function (res) {
                if (res.status != 200) {
                    console.log("error, status code: ", res.status);
                    return;
                }
                res.json().then(function (data) {
                    for (var i = 0; i < data.length; i++) {
                        var pos = ltoc(data[i].reclat, data[i].reclong);
                        ctx.moveTo(pos.long, pos.lat);
                        ctx.fillStyle = "rgba(244, 67, 54, .8)";
                        var w = 3,
                            h = 3;
                        ctx.fillRect(pos.long, pos.lat, w, h);
                        pts.push(new Landing(pos.long, pos.lat, w, h, data[i].mass, data[i].name, data[i].year, data[i].reclat, data[i].reclong))
                        ctx.fill();
                    }
                    offset += limit;
                    if (offset <= 50000) {
                        get(offset);
                    }
                });
            }).catch(function (err) {
                console.log("error fetching: " + err)
            })
        })(0);
    }
    img.src = "map.svg";
    canvas.addEventListener('mousemove', mousemoved, false);
}

function mousemoved(e) {
    var x = e.clientX,
        y = e.clientY;
    for (var i = 0; i < pts.length; i++) {
        if (x > pts[i].x + 2 && x < pts[i].x + pts[i].w + 2 && y > pts[i].y + 2 && y < pts[i].y + pts[i].h + 2) {
            var title = document.getElementById('title')
            title.style.top = (y - 4) + "px";
            title.innerHTML = pts[i].name;
            title.style.left = (x - (title.clientWidth / 2) + 8) + "px";
            title.style.visibility = "visible";
            title.style.opacity = 1;
            title.onmouseout = function (e) {
                title.style.visibility = "hidden";
                title.style.opacity = 0;
            }
            title.setAttribute('onclick', 'clicked(' + i + ")");
        }
    }
}

function clicked(i) {
    closeInfo();
    var info = document.getElementById('info');
    var img = document.createElement('img');
    img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAABpUlEQVRoQ+3Y4U0DMQwF4NcN2KSwAd0EJoBRYALYhG5A2YQRkKULiiB3eY6fJTilf3ux89npJc0BO/kcduLAhPy1Ts6OzI4kVWAuraTCDof1dOQKwBuAZwCvwxm5gXcAHgCcAHwyQ1hIQVwvQe8TMYZ4WfJcWAwLeQdQEKVAGZgaUfIY5qbXFRbSSmCxlZhQDhZikw4l6lQ0HNsDycKEETYxL0SNkSBGISqMDBGBRDFSRBQyipEjFBAvJgWhgrCYNIQS0sPY9+XYUW8psg115PW7tbetVb01RoZQd6RMlsFIEVmQrWWmPp99d1q9tJiuyLuR1ZFdLC0GUbom7YxyaW3tE//m9ctsdswznb8t618rOuKZoOdZFyoKGZnYyJguKgKJTCgytokahSgmoogR2hCVE5DF8nZElrhaH5KYHogk4cqvNhybhYQTdV87wXszFmLXlscfk5EeMZbYrYJ9NK5rf9WFhdgl9rnCZCBaJ2dD3DI38izEkhTMU+JNfI15ZBFZx3ji56B/xNMRfXZhxAkRFlMSanZEUkZhkNkRYTEloXbTkS88hnQzoseyegAAAABJRU5ErkJggg==";
    img.id = "close"
    img.width = 25;
    img.height = 25;
    img.style.cursor = "pointer";
    img.setAttribute('onclick', "closeInfo()");
    info.appendChild(img);
    info.appendChild(document.createElement('br'));
    var heading = document.createElement('div');
    heading.className = "info-heading";
    heading.innerHTML = pts[i].name;
    info.appendChild(heading);
    var content = document.createElement('div');
    content.className = "info-content";
    content.innerHTML = "Name: " + pts[i].name + "<br>Mass: " + pts[i].mass + "g<br>Year Fallen: " + pts[i].year.substring(0, 4) + "<br>Latitude: " + pts[i].lat + "<br>Longitude: " + pts[i].long;
    info.appendChild(content);
    info.style.right = 0;
}

function closeInfo() {
    var info = document.getElementById('info');
    var r = info.style.width;
    info.innerHTML = "";
    info.style.right = -450 + "px";
}

function ltoc(lat, long) {
    var y = (height / 2) - (lat * (height / 180));
    var x = (width / 2) + (long * (width / 360));
    return {
        "realLat": lat,
        "realLong": long,
        "lat": y,
        "long": x
    }
}

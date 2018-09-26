var btn = $(".continue");
var state = {
    contRadius: 0,
    contStart: false,
    maxLim: 0,
    whiteMode: false,
    logoMultiplier: 0.09,
    core: null,
    mobFactor: 0.6,
    padding: 150,
    minHashtagCount: 10,
    imgDOMS: {},
    people: [],
    beingHovered: null,
    introSkip: false,
    lines: {},
    interv: null,
    indexes: {},
    Edgy: {}
};

firsttime = true;
setoftweets = ["Silence."]

function drawArrow(base, vec) {
    push();
    translate(base.x, base.y);
    line(0, 0, vec.x, vec.y);
    rotate(vec.heading());
    var arrowSize = 7;
    translate(vec.mag() * 0.5, 0);
    triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize * 1.15, 0);
    pop();
}
function mousePressed() {

}
btn.on("click", function () {
    state.contStart = true;
    btn.addClass("white-btn")
})

$(".cato").on("click", function () {
    state.introSkip = true;
    $(".cato").removeClass("selected");
    $(this).addClass("selected");
    new_cat = $($(this).find(".name")[0]).text();
    state.currentCat = new_cat;
    state.people = []
    $("#featured").html("");
    $("#title").html("");
    $("#fthash").html("");
    $(".fol_count").html("")
    $(".tot_count").html("")
    $(".category_name").html(new_cat)
    // var cat_info = state.core.category[new_cat];
    cat_info = state.core.cc[new_cat];

    $(".cc").html(`${parseInt(cat_info["avg"] * 10000) / 100}% (${cat_info["avg"] > 0.45 ? "High" : cat_info["avg"] > 0.2 ? "Medium" : "Low"})`);
    $(".most").html(cat_info["most"]);
    $(".most_val").html(`(${cat_info["most_val"]})`);
    $(".hashes").html(`${Object.entries(state.core.hashtags[new_cat]).map(v => `<div class="hash">${v[0]} (${v[1]})</div>`).join("")}`);
    $(".info_cat").html(state.core.info[new_cat] || "");
    setoftweets = state.core.tt.filter(v => v.category == new_cat).sort((a, b) => a.date - b.date);
    if (setoftweets.length == 0) setoftweets = ["Silence."]
    loopThrough(setoftweets, false, false);

    createGraph(new_cat);
    setupPeople(new_cat);

})




function setupPeople(cat) {
    $(".pplthumbdiv").css("display", "none");
    $(`.${cat}`).css("display", "flex")
    // state.core.peeps.filter(p => p.category === cat).forEach(person => {
    //     state.people.push(new Person(person))
    // })
}
var renderer;
function zim(n){
    var size = map(n,1000,40000000,1,6);
    if(n<1000)return `<span>${n}</span>`;
    if(n<100000)return `<span style="font-size:${size}em">${parseInt(n/1000)}K</span>`;
    if(n<10000000)return `<span style="font-size:${size}em">${parseInt(n/100000)}L</span>`;
    else return `<span style="font-size:${size}em">${parseInt(n/10000000)}Cr</span>`;
}
function sheen(n){
    return `<span style="font-size:${map(n,0,300,1,6)}em">${n}</span>`;
}
function setup() {

    $(":checkbox").change(function (e) {
        if($(this).val()=="hashtags"){
        if (this.checked) {
            $("#showfoll").prop("checked",false)
            $("#showtotal").prop("checked",false)
            $(".pplthumbdiv").each(function (i,v) {
                var id = $(v).attr("id");
                var topone = Object.keys(state.core.peeps.find(v => v.username == id).top_5)[0];
                $(v).find(".person_name").first().html(topone?"#"+topone:"")
            })
        }
        else {
            $(".pplthumbdiv").each(function (i,v) {
                $(v).find(".person_name").first().html($(this).data("name"))
            })
        }
    }
    else if($(this).val()=="followers"){
        if(this.checked){
            $("#showhash").prop("checked",false)
            //$("#showfoll").prop("checked",false)
            $("#showtotal").prop("checked",false)
            $(".pplthumbdiv").each(function (i,v) {
                var id = $(v).attr("id");
                $(v).find(".person_name").first().html(zim(state.core.peeps.find(v => v.username == id).followers)).css("width","inherit")
            })
        }
        else {
            $(".pplthumbdiv").each(function (i,v) {
                $(v).find(".person_name").first().html($(this).data("name"))
            })
        }
    }
    else if($(this).val()=="total"){
        if(this.checked){
            $("#showhash").prop("checked",false)
            $("#showfoll").prop("checked",false)
            //$("#showtotal").prop("checked",false)
            $(".pplthumbdiv").each(function (i,v) {
                var id = $(v).attr("id");
                $(v).find(".person_name").first().html(sheen(state.core.peeps.find(v => v.username == id).total)).css("width","inherit")
            })
        }
        else {
            $(".pplthumbdiv").each(function (i,v) {
                $(v).find(".person_name").first().html($(this).data("name"))
            })
        }
    }
    })

    createGraph = function (kat) {
        function loadGraph() {
            NodesName = {}
            state.core.peeps.filter(v => v.category == kat).map(k => {
                NodesName[k.username] =
                    graph.newNode({
                        element: k.username
                    })
            });

            for (guy in state.core.connections[kat]) {
                var connected_to = state.core.connections[kat][guy];
                connected_to.map(g => {

                    graph.newEdge(NodesName[guy], NodesName[g])
                })
            }
        }
        if (renderer) {
            graph.edges.slice().map(function (edge) {
                graph.removeEdge(edge);
            });
            graph.nodes.slice().map(function (node) {
                graph.removeNode(node);
            });
            loadGraph();
        }
        else {
            graph = new Springy.Graph();
            loadGraph();
            layout = new Springy.Layout.ForceDirected(graph, 10.0, 150.0, 0.5);
            const convToReal = function (p, dim) {
                bounds = layout.getBoundingBox()
                if (dim == "w") {
                    return map(p, bounds.bottomleft.x, bounds.topright.x, 0.1 * width, width);
                }
                else {
                    return map(p, bounds.bottomleft.y, bounds.topright.y, 0.05 * height, height)
                }

            }
            renderer = new Springy.Renderer(layout,
                function clear() {
                    state.lines = {};
                },
                function drawEdge(edge, p1, p2) {
                    //console.log(edge,p1,p2)
                    let startname = edge.source.data.element;
                    let endname = edge.target.data.element;
                    let searchkey = startname < endname ? `${startname}~${endname}` : `${endname}~${startname}`;
                    state.lines[edge.id] = [convToReal(p1.x, "w"), convToReal(p1.y, "h"), convToReal(p2.x, "w"), convToReal(p2.y, "h"), startname, endname, state.Edgy[searchkey]];
                },
                function drawNode(node, p) {
                    //console.log(node, p)

                    $(`#${node.data.element}`).css({
                        left: convToReal(p.x, "w") - $(`#${node.data.element}`).outerWidth() / 2,
                        top: convToReal(p.y, "h") - $(`#${node.data.element}`).outerHeight() / 2,
                    })
                }
            );
            renderer.start();
        }
    }
    $(document).on('mouseenter mouseleave', '.pplthumbdiv', function (e) {
        if (e.type == "mouseenter" && state.beingHovered === null) {
            state.beingHovered = $(this).data("username");

            state.beingHoveredData = state.core.peeps.filter(p => p.username == state.beingHovered)[0];
            $("#featured").html(state.beingHoveredData.name + " (@" + state.beingHoveredData.username + ")")
            var desc = state.beingHoveredData.description;
            $("#title").html(desc)
            var top5 = Object.keys(state.beingHoveredData.top_5);
            $("#fthash").html(top5.map(v => "#" + v).join(", "))
            $(".fol_count").html(state.beingHoveredData.followers+" followers | ")
            $(".tot_count").html(state.beingHoveredData.total)
            $(".pplthumbdiv").addClass("dimmed");
            $(`#${state.beingHovered}`).removeClass("dimmed");
            state.beingHovered in state.core.connections[state.currentCat] && state.core.connections[state.currentCat][state.beingHovered].map(v => {
                $(`#${v}`).removeClass("dimmed");
            })
            Object.entries(state.core.connections[state.currentCat]).filter(v => v[1].indexOf(state.beingHovered) != -1).map(v => {
                $(`#${v[0]}`).removeClass("dimmed");
            })
            tempInd = 0;
            setoftweets = state.core.tt.filter(v => v.username == state.beingHovered).sort((a, b) => a.date - b.date);
            if (setoftweets.length == 0) setoftweets = ["Silence."]
        }
        else {
            $(".pplthumbdiv").removeClass("dimmed")


            if (!mouseIsPressed) {
                state.beingHovered = null;
            }
        }

    });
    let myCanvas = createCanvas(innerWidth, innerHeight);
    myCanvas.parent("p5container");
    state.maxLim = width > height ? width : height;
    //If mobile, reduce speed by 30%
    textAlign(CENTER, CENTER)
    state.mobFactor = width > height ? 1 : state.mobFactor;
    loadJSON("final.json", loadedData)
    textFont("Inter UI");
}


function removeOverlay() {
    $(".bigoverlay").css("display", "none")
}

function loadedData(data) {
    state.core = data;
    var ppl_loaded = 0;
    //build state.imgDOMS
    data.peeps.forEach(person => {
        let persons_hashtags = Object.keys(person.top_5);
        var rel = persons_hashtags.some(key => ["377", "congratsindia", "supremecourt", "loveislove", "lgbt", "pride"].some(v => key.indexOf(v) != -1)) || state.core.tt.filter(v => v.username == person.username).length > 0;
        var dom_created = createImg(`img/${person.username}.jpg`, function () {
            ppl_loaded++;
            //updateLoading(ppl_loaded)
            $("#ppl_loaded").html(`${ppl_loaded} / 377`)
            $(".whitebar").css("width", `${100 * (ppl_loaded / 377)}%`)
            $(".greybar").css("width", `${100 - 100 * (ppl_loaded / 377)}%`)
            if (ppl_loaded == 377) {
                removeOverlay();
            }
        }).addClass("pplthumb");
        if (!rel) dom_created.addClass("grayscale");
        var parentDiv = createDiv(`<span class="person_name ${rel ? "whitebar" : ""}">${person.name}</span>`).addClass("pplthumbdiv").addClass(person.category).id(person.username);
        $(`#${person.username}`).attr("data-name", person.name).attr("data-username", person.username).attr("data-hashtags", Object.keys(person.top_5).join(", "));
        dom_created.parent(parentDiv);
        parentDiv.position(random(0.3 * width, 0.8 * width), random(0.1 * height, 0.9 * height));
        state.imgDOMS[person.username] = parentDiv
        for (let cat in state.core.connections) {
            for (let start in state.core.connections[cat]) {
                let ends = state.core.connections[cat][start]
                for (let end of ends) {
                    if (start < end) {
                        if (start + "~" + end in state.Edgy) state.Edgy[start + "~" + end] += 1
                        else state.Edgy[start + "~" + end] = 1
                    }
                    else {
                        if (end + "~" + start in state.Edgy) state.Edgy[end + "~" + start] += 1
                        else state.Edgy[end + "~" + start] = 1
                    }
                }
            }
        }
    })
}


const loopThrough = (src, person, mse) => {

    var seed;
    if (state.interv) clearInterval(state.interv)

    if (person) {
        seed = src[tempInd % src.length]
    }
    else {
        if (!(state.currentCat in state.indexes)) state.indexes[state.currentCat] = 0;
        state.indexes[state.currentCat]++;
        seed = src[state.indexes[state.currentCat] % src.length];
    }

    if (!src) return;
    if (src[0] == "Silence.") {
        $("#tv").fadeOut(function () {
            $(".show_date").text("")
            $(".show_tweet").text("Silence.")
            $(".show_person").text("")
        }).fadeIn();
    }
    else {
        seed.txt && $("#tv").fadeOut(function () {
            var a = new Date(seed.date + 19800000)
            $(".show_date").text(src[0] == "Silence." ? "" : `${a.getDate()}th Sep, ${a.getHours() > 12 ? 24 - a.getHours() : a.getHours()}:${a.getMinutes() < 10 ? "0" + a.getMinutes() : a.getMinutes()} ${a.getHours() >= 12 ? "pm" : "am"}`)
            $(".show_tweet").text(src[0] == "Silence." ? "Silence." : (seed.txt || "").split(" ").filter(v => !v.startsWith("https:")).join(" "))
            $(".show_person").text(src[0] == "Silence." ? "" : seed.person)
        }).fadeIn();
    }

    state.interv = setInterval(function () {
        if (person) {
            tempInd++;
            seed = src[tempInd % src.length]
        }
        else {
            state.indexes[state.currentCat]++;
            seed = src[state.indexes[state.currentCat] % src.length];
        }
        if (src[0] == "Silence.") {
            $("#tv").fadeOut(function () {
                $(".show_date").text("")
                $(".show_tweet").text("Silence.")
                $(".show_person").text("")
            }).fadeIn();
        }
        else {
            seed.txt && $("#tv").fadeOut(function () {
                var a = new Date(seed.date + 19800000)
                $(".show_date").text(src[0] == "Silence." ? "" : `${a.getDate()}th Sep, ${a.getHours() > 12 ? 24 - a.getHours() : a.getHours()}:${a.getMinutes() < 10 ? "0" + a.getMinutes() : a.getMinutes()} ${a.getHours() >= 12 ? "pm" : "am"}`)
                $(".show_tweet").text(src[0] == "Silence." ? "Silence." : (seed.txt || "").split(" ").filter(v => !v.startsWith("https:")).join(" "))
                $(".show_person").text(src[0] == "Silence." ? "" : seed.person)
            }).fadeIn();
        }
    }, 6000)
}
function whiteMode() {
    $(".message").css("display", "none");
    $(".whiteMode").css("display", "flex");
    state.whiteMode = true;
    $('#trig').trigger('click');
}
function draw() {
    background("#222")
    smooth(); noStroke(); fill(255);
    ellipse(mouseX, mouseY, state.contRadius, state.contRadius);
    if (state.contStart && state.contRadius < 3 * state.maxLim) {
        state.contRadius += (100 * state.mobFactor);
        if (state.contRadius >= 3 * state.maxLim) {
            //runs just once
            whiteMode();

        }
    }
    if (state.whiteMode) {
        for (linea in state.lines) {
            myLine = state.lines[linea];
            //console.log(myLine[4])
            if (state.beingHovered) {
                var start = createVector(myLine[0], myLine[1])
                var end = createVector(myLine[2], myLine[3])

                var both = myLine[6] == 754;
                var startname = myLine[4]
                var endname = myLine[5]
                //my_lines = Object.values(state.lines).filter(v => (v[4]==state.beingHovered || v[5]==state.beingHovered))
                //var both;

                if (state.beingHovered == startname || state.beingHovered == endname) {
                    //look if endname,startname is there
                    if (both) {
                        strokeWeight(1.4); stroke("#a513f4"); line(myLine[0], myLine[1], myLine[2], myLine[3]);
                    }
                    else {
                        stroke(state.beingHovered == startname ? "#126EFC" : "#f41685"); strokeWeight(0.8);
                        drawArrow(start, p5.Vector.sub(end, start))
                    }

                }
            }
            else {

                stroke(180); strokeWeight(0.5);
                if (state.beingHovered != null) {
                    stroke(240); strokeWeight(0.1);
                }
                line(myLine[0], myLine[1], myLine[2], myLine[3]);
            }


        }
    }
}
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
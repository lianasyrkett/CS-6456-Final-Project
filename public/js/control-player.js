$(document).ready(function() {
    document.onkeypress = function(e) {
        e = e || window.event;
        // console.log(e.keyCode);

        if (e.keyCode === 102) {
            $("#next").click();
            console.log("Going to next song.");
        }

        if (e.keyCode === 98) {
            $("#previous").click();
            console.log("Going to previous song.");
        }
    };

    window.onkeydown = function(e) {
        return !(e.keyCode == 32);
    };

    /*
        Handles a click on the down button to slide down the playlist.
    */
    document
        .getElementsByClassName("down-header")[0]
        .addEventListener("click", function() {
            var list = document.getElementById("list");

            list.style.height =
                parseInt(
                    document.getElementById("flat-black-player-container")
                        .offsetHeight
                ) -
                135 +
                "px";

            document
                .getElementById("list-screen")
                .classList.remove("slide-out-top");
            document
                .getElementById("list-screen")
                .classList.add("slide-in-top");
            document.getElementById("list-screen").style.display = "block";
        });

    /*
        Handles a click on the up arrow to hide the list screen.
    */
    document
        .getElementsByClassName("hide-playlist")[0]
        .addEventListener("click", function() {
            document
                .getElementById("list-screen")
                .classList.remove("slide-in-top");
            document
                .getElementById("list-screen")
                .classList.add("slide-out-top");
            document.getElementById("list-screen").style.display = "none";
        });

    /*
        Handles a click on the song played progress bar.
    */
    document
        .getElementById("song-played-progress")
        .addEventListener("click", function(e) {
            var offset = this.getBoundingClientRect();
            var x = e.pageX - offset.left;

            Amplitude.setSongPlayedPercentage(
                (parseFloat(x) / parseFloat(this.offsetWidth)) * 100
            );
        });

    document.querySelector(
        'img[data-amplitude-song-info="cover_art_url"]'
    ).style.height =
        document.querySelector('img[data-amplitude-song-info="cover_art_url"]')
            .offsetWidth + "px";

    // https://www.soundhelix.com/audio-examples
    Amplitude.init({
        bindings: {
            37: "prev",
            39: "next",
            32: "play_pause",
        },
        songs: [
            {
                name: "Neon Lights",
                artist: "Kraftwerk",
                album: "Die Mensch-Maschine",
                url:
                    "/songs/neon_lights.mp3",
                cover_art_url:
                    "https://img.discogs.com/cq32eC2sTY-xM_EZw6z07AWJNnM=/fit-in/600x596/filters:strip_icc():format(jpeg):mode_rgb():quality(90)/discogs-images/R-10205007-1493483646-6214.jpeg.jpg",
            },
            {
                name: "Vitamin C",
                artist: "Can",
                album: "Ege Bamyasi",
                url:
                    "/songs/vitaminC.mp3",
                cover_art_url:
                    "https://www.progarchives.com/progressive_rock_discography_covers/667/cover_1351626112016_r.jpg",
            },
            {
                name: "Slip",
                artist: "Autechre",
                album: "Amber",
                url:
                    "/songs/slip.mp3",
                cover_art_url:
                    "https://miro.medium.com/max/600/1*RKRq7wufhh8FNevgabJYsg.jpeg",
            },
            {
                name: "Pokka Pokka",
                artist: "Fishmans",
                album: "Uchu Nippon Setagaya",
                url: "/songs/pokkapokka.mp3",
                cover_art_url:
                    "https://e.snmc.io/i/600/w/92e40003cf8fa1e1478fb42dcebff572/6122404",
            },
            {
                name: "Since I Left You",
                artist: "The Avalanches",
                album: "Since I Left You",
                url:
                    "/songs/sily.mp3",
                cover_art_url:
                    "https://classicalbumsundays.com/wp-content/uploads/2020/02/pUr7dcrDRiq_e6UtcPlwhg.jpg",
            },
            {
                name: "18 ssbA",
                artist: "Aphex Twin",
                album: "Soundcloud",
                url: "/songs/ssbA.mp3",
                cover_art_url:
                    "https://i.pinimg.com/originals/f5/75/e4/f575e49152483afc45d02cb59832360d.jpg",
            }

        ],
        volume_increment: 10,
        volume_decrement: 10
    });
});

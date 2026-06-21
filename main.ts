/* example code for a song
function treble() {
    music.playNotes(
        music.createInstrument(
            Waveshape.Sine,
            [0, 0, 768, 5, 768],
            [0, 0, 0, 0, 0],
            [0, 0],
            [0, 0],
            2
        ), [
            new music.SongNote(20, 500, 128),
            new music.SongNote(25, 500, 128),
            new music.SongNote(29, 500, 128),
            new music.SongNote(20, 500, 128),
            new music.SongNote(25, 500, 128),
            new music.SongNote(29, 500, 128),

            new music.SongNote(15, 500, 128),
            new music.SongNote(22, 500, 128),
            new music.SongNote(29, 500, 128),
            new music.SongNote(15, 500, 128),
            new music.SongNote(22, 500, 128),
            new music.SongNote(29, 500, 128),

            new music.SongNote(13, 500, 128),
            new music.SongNote(20, 500, 128),
            new music.SongNote(27, 500, 128),
            new music.SongNote(13, 500, 128),
            new music.SongNote(20, 500, 128),
            new music.SongNote(27, 500, 128),

            new music.SongNote(10, 500, 128),
            new music.SongNote(17, 500, 128),
            new music.SongNote(22, 500, 128),
            new music.SongNote(10, 500, 128),
            new music.SongNote(17, 500, 128),
            new music.SongNote(22, 500, 128),
        ]
    )
}

function bass() {
    music.playNotes(
        music.createInstrument(
            Waveshape.Square50,
            [0, 0, 1024, 5, 1024],
            [0, 0, 0, 0, 0],
            [0, 0],
            [0, 0],
            0
        ), [
            new music.SongNote(20, 3000, 128),
            new music.SongNote(15, 3000, 128),
            new music.SongNote(20, 3000, 128),
            new music.SongNote(17, 3000, 128),
        ]
    )
}

let first = false
game.onUpdateInterval(12000, function() {
    treble()

    if (!first) first = true
    else bass()
})
*/
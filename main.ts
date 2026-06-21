/* example code for a song
function treble() {
    music.playNotes(
        music.createInstrument(
            Waveshape.Sine,
            [0, 0, 1024, 0, 1024],
            [0, 0, 0, 0, 0],
            [0, 0],
            [0, 0],
            0
        ), [
            new music.SongNote([music.key(Key.G, 3)], 500, 128),
            new music.SongNote([music.key(Key.C, 4)], 500, 128),
            new music.SongNote([music.key(Key.E, 4)], 500, 128),
            new music.SongNote([music.key(Key.G, 3)], 500, 128),
            new music.SongNote([music.key(Key.C, 4)], 500, 128),
            new music.SongNote([music.key(Key.E, 4)], 500, 128),

            new music.SongNote([music.key(Key.D, 3)], 500, 128),
            new music.SongNote([music.key(Key.A, 3)], 500, 128),
            new music.SongNote([music.key(Key.E, 4)], 500, 128),
            new music.SongNote([music.key(Key.D, 3)], 500, 128),
            new music.SongNote([music.key(Key.A, 3)], 500, 128),
            new music.SongNote([music.key(Key.E, 4)], 500, 128),

            new music.SongNote([music.key(Key.C, 3)], 500, 128),
            new music.SongNote([music.key(Key.G, 3)], 500, 128),
            new music.SongNote([music.key(Key.D, 4)], 500, 128),
            new music.SongNote([music.key(Key.C, 3)], 500, 128),
            new music.SongNote([music.key(Key.G, 3)], 500, 128),
            new music.SongNote([music.key(Key.D, 4)], 500, 128),

            new music.SongNote([music.key(Key.A, 2)], 500, 128),
            new music.SongNote([music.key(Key.E, 3)], 500, 128),
            new music.SongNote([music.key(Key.A, 3)], 500, 128),
            new music.SongNote([music.key(Key.A, 2)], 500, 128),
            new music.SongNote([music.key(Key.E, 3)], 500, 128),
            new music.SongNote([music.key(Key.A, 3)], 500, 128),
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
            new music.SongNote([music.key(Key.G, 1)], 3000, 128),
            new music.SongNote([music.key(Key.D, 1)], 3000, 128),
            new music.SongNote([music.key(Key.G, 1)], 3000, 128),
            new music.SongNote([music.key(Key.E, 1)], 3000, 128),
        ]
    )
}

let first = false
game.onUpdateInterval(12000, function() {
    treble()

    if (!first) first = true
    else bass()
})
/**/
/* example code for a song
function treble() {
    music.playNotes(
        music.createInstrument(
            Waveshape.Sawtooth,
            [10, 0, 1024, 10, 1024],
            [0, 0, 0, 0, 0],
            [0, 0],
            [0, 0],
            0
        ), [
            new music.SongNote([music.key(Key.G, 3)], 500, 70),
            new music.SongNote([music.key(Key.C, 4)], 500, 70),
            new music.SongNote([music.key(Key.E, 4)], 500, 70),
            new music.SongNote([music.key(Key.G, 3)], 500, 70),
            new music.SongNote([music.key(Key.C, 4)], 500, 70),
            new music.SongNote([music.key(Key.E, 4)], 500, 70),

            new music.SongNote([music.key(Key.D, 3)], 500, 70),
            new music.SongNote([music.key(Key.A, 3)], 500, 70),
            new music.SongNote([music.key(Key.E, 4)], 500, 70),
            new music.SongNote([music.key(Key.D, 3)], 500, 70),
            new music.SongNote([music.key(Key.A, 3)], 500, 70),
            new music.SongNote([music.key(Key.E, 4)], 500, 70),

            new music.SongNote([music.key(Key.C, 3)], 500, 70),
            new music.SongNote([music.key(Key.G, 3)], 500, 70),
            new music.SongNote([music.key(Key.D, 4)], 500, 70),
            new music.SongNote([music.key(Key.C, 3)], 500, 70),
            new music.SongNote([music.key(Key.G, 3)], 500, 70),
            new music.SongNote([music.key(Key.D, 4)], 500, 70),

            new music.SongNote([music.key(Key.A, 2)], 500, 70),
            new music.SongNote([music.key(Key.E, 3)], 500, 70),
            new music.SongNote([music.key(Key.A, 3)], 500, 70),
            new music.SongNote([music.key(Key.A, 2)], 500, 70),
            new music.SongNote([music.key(Key.E, 3)], 500, 70),
            new music.SongNote([music.key(Key.A, 3)], 500, 70),
        ]
    )
}

function bass() {
    music.playNotes(
        music.createInstrument(
            Waveshape.Triangle,
            [0, 0, 1024, 5, 1024],
            [0, 0, 0, 0, 0],
            [0, 0],
            [0, 0],
            0
        ), [
            new music.SongNote([music.key(Key.G, 1)], 3000, 222),
            new music.SongNote([music.key(Key.D, 1)], 3000, 222),
            new music.SongNote([music.key(Key.G, 1)], 3000, 222),
            new music.SongNote([music.key(Key.E, 1)], 3000, 222),
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
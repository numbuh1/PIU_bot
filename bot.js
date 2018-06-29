var Discord = require('discord.js');
var logger = require('winston');
var auth = require('./auth.json');
var songs = require('./lib/songs.json');
var updates = require('./lib/updates.json');
var quests = require('./lib/quests.json');

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});

bot.on('ready', function (evt) {
    logger.info('Connected');
});

bot.on('message', function (message) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    var content = message.content;
    if (content.substring(0, 5) == '!piu ') {
        var args = content.substring(5).split(' ');
        var cmd = args[0];
       
        args = args.splice(1);
        switch(cmd) {
            // !ping
            case 'song':
                var msg = '';
                var songString = content.substring(10);
                var song = songs.filter(songs => songs.name.toLocaleLowerCase() == songString.toLocaleLowerCase());

                if(song.length == 0) {
                    song = songs.filter(songs => songs.name.toLocaleLowerCase().includes(songString.toLocaleLowerCase()));
                }

                if(song.length > 1) {
                    var dataString = "";
                    for (var i = 0; i < song.length; i++) {
                        dataString += i + ". [" + song[i].channel + "] " + song[i].name + "\n";
                    }

                    message.channel.send({
                        embed: {
                            color: 3447003,
                            title: "Multiple songs detected. Please choose a number",
                            description: dataString,
                        }
                    });
                    const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 10000 });
                    collector.on('collect', message => {
                        var content = parseInt(message.content);
                        if (content != NaN && content >= 0 && content < song.length) {
                            var songData = showSong(song[content]);
                            if(song[content].image) {
                                message.channel.send({
                                    embed: {
                                        color: 3447003,
                                        image: {
                                            "url": song[content].image
                                        }
                                    }
                                });
                            }                    
                            message.channel.send(songData);
                        }
                    })
                } else if(song.length == 1) {
                    var songData = showSong(song[0]);
                    if(song[0].image) {
                        message.channel.send({
                            embed: {
                                color: 3447003,
                                image: {
                                    "url": song[0].image
                                }
                            }
                        });
                    }                    
                    message.channel.send(songData);
                } else {
                    message.channel.send({
                        embed: {
                            color: 3447003,
                            description: "No song available by that name",
                            timestamp: new Date(),
                            footer: {
                              text: "PIU Bot © numbuh1"
                            }
                        }
                    });
                }
                
                break;
            case 'update':
                var updateString = content.substring(12);
                var msg = '';
                var update;
                if(updateString == '') {
                    update = updates[0];
                } else {
                    update = updates.filter(update => update.version.toLocaleLowerCase().includes(updateString.toLocaleLowerCase()));
                    if(update.length == 0) {
                        message.channel.send({
                            embed: {
                                color: 3447003,
                                description: "No update available by that name",
                                timestamp: new Date(),
                                footer: {
                                  text: "PIU Bot © numbuh1"
                                }
                            }
                        });
                    } else {
                        update = update[0];
                    }
                }

                var fields = [];

                if(update.songs && update.songs.length > 0) {
                    fields.push({
                        name: "★ __Songs__ ★",
                        value: update.songs.length + " new songs"
                    });

                    for (var i = 0; i < update.songs.length; i++) {
                        var dataString = "Artist: " + update.songs[i].artist + "\nBPM: " + update.songs[i].bpm + "\n" + update.songs[i].channel + " - " + update.songs[i].type + "\n" + update.songs[i].charts;
                        
                        fields.push({
                            name: update.songs[i].name,
                            value: dataString,
                            inline: true
                        });
                    }
                }

                if(update.charts && update.charts.length > 0) {
                    var chartString = "";

                    for (var i = 0; i < update.charts.length; i++) {
                        chartString += "・" + update.charts[i] + "\n";
                    }

                    fields.push({
                        name: "★ __Charts__ ★",
                        value: chartString
                    });
                }

                if(update.missions && update.missions.length > 0) {
                    var missionString = "";

                    for (var i = 0; i < update.missions.length; i++) {
                        missionString += "・" + update.missions[i] + "\n";
                    }

                    fields.push({
                        name: "★ __Quests__ ★",
                        value: missionString
                    });
                }

                fields.push({
                    name: "★ __Download__ ★",
                    value: update.download
                });

                var data = {
                        embed: {
                            color: 3447003,                            
                            title: update.version,
                            description: update.description,
                            fields: fields,
                            timestamp: new Date(),
                            footer: {
                              text: "PIU Bot © numbuh1"
                            }
                        }
                    };

                if(update.image) {
                    data.embed.thumbnail = {
                        url: update.image
                    };
                }

                message.channel.send(data);
                break;
            case 'quest':
                var questString = content.substring(11);
                showQuest(message, questString);
                break;
            case 'help':
                showHelp(message);
                break;
            // Just add any case commands if you want to..
         }
     }
});

bot.login(auth.token);

function showHelp(message) {
    message.channel.send({
        embed: {
            color: 3447003,
            title: "★ PIU Bot Alpha 1.0 ★ List of Commands ★",
            description: "========================================",
            fields: [
                {
                    name: "・!piu song [SongName]",
                    value: "Get information of a song in PIU Prime 2"
                },
                {
                    name: "・!piu update [Version]",
                    value: "Get changelog of an update in PIU Prime 2 (2.02.0 - 2.04.0)"
                },
                {
                    name: "・!piu quest [SongName]",
                    value: "Get information of a quest in PIU Prime 2 (Chapter 8 - 9)"
                },
            ],
            timestamp: new Date(),
            footer: {
              text: "PIU Bot © numbuh1"
            }
        }
    });
}

function showQuest(message, query) {
    
    var result = quests.filter(quest => quest.song.toLocaleLowerCase().includes(query.toLocaleLowerCase()));

    if(result.length > 1) {
        var dataString = "";
        for (var i = 0; i < result.length; i++) {
            dataString += i + ". [Chapter " + result[i].chapter + "] " + result[i].song + "\n";
        }

        message.channel.send({
            embed: {
                color: 3447003,
                title: "Multiple songs detected. Please choose a number",
                description: dataString,
            }
        });
        const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 10000 });
        collector.on('collect', message => {
            var content = parseInt(message.content);
            if (content != NaN && content >= 0 && content < result.length) {
                var questData = showQuestDetails(result[content]);
                message.channel.send({
                    embed: {
                        color: 3447003,
                        image: {
                            "url": result[content].image
                        }
                    }
                });                   
                message.channel.send(questData);
            }
        })
    } else if(result.length == 1) {
        var questData = showQuestDetails(result[0]);
        message.channel.send({
            embed: {
                color: 3447003,
                image: {
                    "url": result[0].image
                }
            }
        });                   
        message.channel.send(questData);
    } else {
        message.channel.send({
            embed: {
                color: 3447003,
                description: "No quest available by that name",
                timestamp: new Date(),
                footer: {
                  text: "PIU Bot © numbuh1"
                }
            }
        });
    }
}

function showQuestDetails(questData) {

    var fields = [];    

    for (var i = 0; i < 4; i++) {
        var questName = "";
        if(questData.quests[i].description != "") {
            questName = " " + questData.quests[i].description + " ★";
        }
        fields.push({
            name: "★ Floor " + (i + 1) + " ★ " + questData.quests[i].chart + " ★" + questName,
            value: "Modifiers: " + questData.quests[i].mods + "\nObjective: " + questData.quests[i].objective
        });
    }

    var data = 
    {
        embed: {
            color: 3447003,
            title: questData.song,
            description: "Chapter " + questData.chapter + " | Version " + questData.version,
            fields: fields,
            timestamp: new Date(),
            footer: {
              text: "PIU Bot © numbuh1"
            }
        }
    }

    return data;
}

function showSong(songData) {    

    // if(songData.image) {
    //     data.embed.image = {
    //         "url": songData.image
    //     };
    // }

    var gameData = songData.game;
    if(songData.version) {
        gameData += " (" + songData.version + ")";
    }

    var fields = [
        {
            name: "★ __Artist__ ★",
            value: songData.artist
        },
        {
            name: "★ __BPM__ ★",
            value: songData.bpm,
            inline: true
        },
        {
            name: "★ __Channel__ ★",
            value: songData.channel,
            inline: true
        },
        {
            name: "★ __Game__ ★",
            value: gameData
        },
        {
            name: "★ __Charts__ ★",
            value: songData.charts
        }
    ];

    if(songData.unlockables != null) {
        var unlockString = "";

        for (var i = 0; i < songData.unlockables.length; i++) {
            unlockString += "・" + songData.unlockables[i].chart + " - " + songData.unlockables[i].price + "\n";
        }

        fields.push({
            name: "★ __Unlockables__ ★",
            value: unlockString
        });
    }

    var data = 
    {
        embed: {
            color: 3447003,
            title: songData.name,
            description: "====================",
            fields: fields,
            timestamp: new Date(),
            footer: {
              text: "PIU Bot © numbuh1"
            }
        }
    }

    return data;
}
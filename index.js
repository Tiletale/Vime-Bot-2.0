const Discord = require('discord.js');
const Bot = new Discord.Client();
const prefix = "v!";
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

Bot.login(process.env.BOT_TOKEN);

Bot.on('ready', () => {
    Bot.user.setActivity('Интересную игру: ' + prefix + 'help', {type: "PLAYING"});
    console.log('Bot started successful');
});

Bot.on('message', async (message) => {
    if (message.author.bot || !message.guild || !message.content.startsWith(prefix)) return false;
    if (message.channel.name != "vimeworldbot") {
        message.reply("Бот доступен только в <#" + message.guild.channels.find('name', 'vimeworldbot').id + ">");
        return false;
    }
    var msg = message.content.slice(prefix.length);
    var args = msg.split(' ');
    switch (msg) {
        case "help":
            message.channel.send("`Команды бота:`\n```• info - показывает информацию о боте\n• online - показывает модеров онлайн\n• players - показывает всех игроков онлайн\n• streams - показывает список стримов на vimeworld\n• stats [игрок] - показывает данные игрока\n• guild [название] - поиск гильдии\n• leaderboard [название] - показывает список лучших игроков```");
            break;
        case "info":
            message.channel.send("```Сделан PHPMasterr'ом\nДискорд сервер моего создателя: https://discord.gg/nKxMfSn\nДискорд сервер Юти: https://discord.gg/yVgrUbr```");
            break;
        case "online":
            var req = new XMLHttpRequest(); 
            var moders = '';
            req.open('GET', 'https://api.vime.world/online/staff', false);   
            req.send();  
            if(req.status == 200)  
                var data = JSON.parse(req.responseText);
            for (var i = 0; i < data.length; i++) {
                if (i == data.length - 1)
                    moders += '`' + data[i].username + '`.';
                else
                    moders += '`' + data[i].username + '`, ';
            }
            var cd = 'Всего модераторов онлайн ' + data.length + ';\n' + moders;
            message.channel.send(cd);
            break;
        case "streams":
            var req = new XMLHttpRequest(); 
            var streams = '';
            req.open('GET', 'https://api.vime.world/online/streams', false);   
            req.send();  
            if(req.status == 200)  
                var data = JSON.parse(req.responseText);
            for (var i = 0; i < data.length; i++) {
                if (i == data.length - 1)
                    streams += '**' + data[i].title + '**.';
                else
                    streams += '**' + data[i].title + '**, ';
            }
            var cd = 'Всего стримов онлайн ' + data.length + ';\n' + streams;
            message.channel.send(cd);
            break;
        case "players":
            var req = new XMLHttpRequest(); 
            var streams = '';
            req.open('GET', 'https://api.vime.world/online', false);   
            req.send();  
            if(req.status == 200)  
                var data = JSON.parse(req.responseText);
            var s = data.separated;
            var online = new Discord.RichEmbed()
            .setTitle("Всего игроков онлайн: " + data.total, ".", true)
            .setColor("#00bfff")
            .addField("BedWars", s.bw, true)
            .addField("SkyWars", s.sw, true)
            .addField("Annihilation", s.ann, true)
            .addField("BuildBattle", s.bb, true)
            .addField("GunGame", s.gg, true)
            .addField("MobWars", s.mw, true)
            .addField("KitPVP", s.kpvp, true)
            .addField("DeathRun", s.dr, true)
            .addField("BlockParty", s.bp, true)
            .addField("HungerGames", s.hg, true)
            .setFooter("Игроков в лобби: " + s.lobby);
            message.channel.send(online);
    }
    if (msg.startsWith('stats')) {
        args[1] = args.splice(1).join(' ');
        var req = new XMLHttpRequest(); 
        req.open('GET', 'http://api.vime.world/user/name/' + args[1], false);
        req.send();
        if(req.status == 200) 
            var data = JSON.parse(req.responseText)[0];
        if(!data) {
            message.channel.send("Игрок не найден :(");
            return false;
        }
        var req = new XMLHttpRequest(); 
        req.open('GET', 'http://api.vime.world/user/' + data.id + '/session', false);
        req.send();
        if(req.status == 200) 
            var data1 = JSON.parse(req.responseText);
        message.channel.send("Ник: [`" + data.rank + "`] `" + data.username + "`\nУровень: " + data.level + "\n" + (data.guild ? "Состоит в гильдии " + data.guild.name : "Не состоит в гильдии") + "\nСыграно около " + Math.round(data.playedSeconds / 60 / 60 / 24) + " дней\n\n" + (data1.online.value ? "Игрок онлайн. " + data1.online.message : data1.online.message));
    }
    else if (msg.startsWith('guild')) {
        args[1] = args.splice(1).join(' ');
        var req = new XMLHttpRequest();
        req.open('GET', 'http://api.vime.world/guild/get?name=' + encodeURIComponent(args[1]), false);
        req.send();
        if(req.status == 200) 
            var data = JSON.parse(req.responseText);
        var perks = "";
        var pls = "";
        for(i in data.perks) {
            perks += data.perks[i].name + ": " + data.perks[i].level + ", ";
        }
        for (var i = 0; i < data.members.length; i++) {
            pls += "`" + data.members[i].user.username + "`, ";
        }
        message.channel.send("Название: `" + data.name + "`\nУровень: " + data.level + "\n\nПрокачка: \n\n" + perks + "\n\nТег: " + (data.tag ? data.tag : "Отсутствует") + "\nЦвет тега: " + (data.tag ? data.color : "Тег отсутствует") + "\n\nИгроки (всего: " + data.members.length + "):\n\n" + pls);
    }
    else if (msg.startsWith('leaderboard')) {
        args[1] = args.splice(1).join(' ');
        var req = new XMLHttpRequest(); 
        req.open('GET', 'http://api.vime.world/leaderboard/list', false);
        req.send();
        if(req.status == 200) 
            var data = JSON.parse(req.responseText);
        for (i in data) {
            if (args[1] == data[i].type) {
                break;
            }else if (i == data.length - 1) {
                message.channel.send("Неизвестное название");
                return false;
            }
        }
        var req = new XMLHttpRequest(); 
        req.open('GET', 'http://api.vime.world/leaderboard/get/' + args[1] + "?size=10", false);
        req.send();
        if(req.status == 200)
            var data = JSON.parse(req.responseText);
        var rs = "";
        if (args[1] == "guild") {
            for (i in data.records) {
                rs += "`" + data.records[i].name + "`, ";
            }
        }
        else if (args[1] == "user") {
            for (i in data.records) {
                rs += "`" + data.records[i].username + "`, ";
            }
        }
        else {
            for (i in data.records) {
                rs += "`" + data.records[i].user.username + "`, ";
            }
        }

        message.channel.send(args[1] != "guild" ? ("Топ 10 лучших игроков" + (args[1] != "user" ? " " + args[1] : "") + ":\n" + rs) : ("Топ 10 лучших гильдий:\n" + rs));
    }
});

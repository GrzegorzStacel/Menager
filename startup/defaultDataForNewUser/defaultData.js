const mongoose = require('mongoose');
const { Company } = require('../../models/Company')
const { Game } = require('../../models/Game');
const cryptedData = require('./cryptedData')
const getDateAndTime = require('./dataTime')

async function defaultDataCreate(user) {
    companiesAndGames = [
        {
            id: '608ff827c19ab741dcfcf71d', // Piranha Bytes
            games: [
                '608ff855c19ab741dcfcf71f', // Gothic 1
                '608ff898c19ab741dcfcf721', // Gothic 2
                '6097c46ba27d2110b4772117' // Gothic 3
            ]
        },
        {
            id: '608ff8dec19ab741dcfcf723', // Rockstar Games
            games: [
                '609b96598ee1c50d34b1a71e', // GTA V
            ]
        },
        {
            id: '6097c5e937e6d95b6c4db5f2', // Blizzard Entertainment
            games: [
                '6097c65037e6d95b6c4db5f5' // Diablo 2
            ]
        },
        {
            id: '609b98487d440e3ca8fadf52', // CD Projekt
            games: [
                '609b98847d440e3ca8fadf54', // Cyberpunk 2077
                '609b9d88e42f5827841c87fa', // Wiedźmin 3
            ]
        }, {
            id: '609b9b521b50cf08387c9e21', // 343 Industries
            games: [
                '609b9b901b50cf08387c9e23', // Halo 5
            ]
        }
    ]

    let cryptedDataCounter = 0

    for (let i = 0; i < companiesAndGames.length; i++) {
        const companyID = await createDefaultCompany(companiesAndGames[i].id, user)

        for (let j = 0; j < companiesAndGames[i].games.length; j++) {
            await createDefaultGame(companiesAndGames[i].games[j], cryptedData[cryptedDataCounter], companyID, user)

            cryptedDataCounter++
        }
    }
}

async function createDefaultCompany(_id, user) {
    try {
        let existCompany = await Company.findOne({
            _id
        })

        existCompany._id = mongoose.Types.ObjectId();
        existCompany.whoCreate = user.name
        existCompany.createdAt = getDateAndTime()
        await Company.collection.insertOne(existCompany);

        user.gamesCompanies.push(existCompany._id);
        await user.save();

        return existCompany._id;
    } catch (error) {
        console.log('Error', error);
    }
}

async function createDefaultGame(_id, _cryptedData, companyID, user) {
    try {
        let existGame = await Game.findOne({
            _id
        })

        existGame._id = mongoose.Types.ObjectId();
        existGame.company = companyID;
        existGame.whoCreate = user.name
        existGame.createdAt = getDateAndTime()

        saveDefaultCover(existGame, _cryptedData)
        await Game.collection.insertOne(existGame);

        user.gamesOwned.push(existGame._id);
        user.whoCreate = user.name

        await user.save();
    } catch (error) {
        console.log('Error', error);
    }
}

function saveDefaultCover(existGame, _cryptedData) {
    if (_cryptedData == null) return

    if (_cryptedData != null) {
        existGame.coverImage = new Buffer.from(_cryptedData.data, 'base64')
        existGame.coverImageType = _cryptedData.type
    }
}

module.exports = defaultDataCreate;
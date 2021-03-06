var express = require('express');
var { graphqlHTTP } = require('express-graphql');
var { buildSchema } = require('graphql');

var gameCatalogue = [
    {
        "id": 1,
        "title": "Game B",
        "publisher": "Publisher ABC",
        "developer": "Developer DEF",
        "releaseDate": "2015-01-01",
        "platforms": [
            { "id": 1, "name": "Xbox" },
            { "id": 2, "name": "Playstation" },
            { "id": 3, "name": "PC" }
        ],
        "esrbRating": {
            "id": 1,
            "code": "E",
            "name": "Everyone"
        }
    },
    {
        "id": 2,
        "title": "Game C",
        "publisher": "Publisher ABC",
        "developer": "Developer DEF",
        "releaseDate": "2018-01-01",
        "platforms": [
            { "id": 1, "name": "Xbox" },
            { "id": 3, "name": "PC" }
        ],
        "esrbRating": {
            "id": 1,
            "code": "E",
            "name": "Everyone"
        }
    },
    {
        "id": 3,
        "title": "Game A",
        "publisher": "Publisher ABC",
        "developer": "Developer DEF",
        "releaseDate": "2020-01-01",
        "platforms": [
            { "id": 1, "name": "Xbox" },
            { "id": 2, "name": "Playstation" }
        ],
        "esrbRating": {
            "id": 2,
            "code": "M",
            "name": "Mature"
        }
    }
]

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
  type Query {
    games: [Game]
    getGame(id: Int!): Game
  },
  type EsrbRating{
      id: Int
      code: String
      name: String
  },
  type Platform {
      id: Int
      name: String
  },

  type Game {
    id: Int
    title: String
    publisher: String
    developer: String
    releaseDate: String
    platforms: [Platform]
    esrbRating: EsrbRating
  },
  
  input EsrbRatingInput{
    id: Int
    code: String
    name: String
  },
  input PlatformInput {
    id: Int
    name: String
  },
  
  input GameInput{
    id: Int
    title: String
    publisher: String
    developer: String
    releaseDate: String
    platforms: [PlatformInput]
    esrbRating: EsrbRatingInput
  },
  

  type DeleteResponse {
    ok: Boolean!
  },

  type Mutation {
    setGame(input: GameInput): Game
    deleteGame(id: Int!): DeleteResponse
    editGame(id: Int!, title:String!): Game
  }


 
`);

// The root provides a resolver function for each API endpoint
var root = {
    games: () => gameCatalogue,
    getGame: ({id}) => {
        let targetGame = gameCatalogue.filter(item => item.id === id)
        if (targetGame){
            return targetGame[0]
        }
        else{
            throw new Error("The ID does not exist")
        }
    },
    setGame: ({input}) => {
        gameCatalogue.push({id:input.id, title:input.title,publisher:input.publisher,
                            developer:input.developer, releaseDate: input.releaseDate,
                            platforms:input.platforms, esrbRating:input.esrbRating})
        return input
    },
    deleteGame: ({id})=> {
        let targetGame = gameCatalogue.filter(item => item.id === id)
        const ok = Boolean(targetGame)
        let delc = targetGame[0]
        gameCatalogue = gameCatalogue.filter(item => item.id !== id)
        console.log(JSON.stringify(delc))
        return {ok}
    },
    editGame: ({id,...title}) => {
        let targetGame = gameCatalogue.filter(item => item.id === id)
        if (!targetGame){
            throw new Error("Game does not exist")
        }
        let indexOfTarget = gameCatalogue.indexOf(targetGame[0])
        gameCatalogue[indexOfTarget] = {
            ...gameCatalogue[indexOfTarget], ...title
        }
        return gameCatalogue[indexOfTarget]
    }
};

var app = express();
app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
}));
app.listen(4000);
console.log('Running a GraphQL API server at http://localhost:4000/graphql');
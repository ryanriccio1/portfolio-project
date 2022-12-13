// fake enum to create easy to read code
const BoardState = {
    X: "X",
    O: "O",
    Empty: "Empty"
} 

// store global state of game
var currentTurn = BoardState.X
var cpuGame = true

// allow blocking of either human input or computer input
var cpuHalt = false
var humanHalt = false

// in the current implementation, this does not change, 
// but it may in the future
var humanPlayer = BoardState.X
var cpuPlayer = BoardState.O

// store info about a posistion on the game board
class BoardSpace 
{   
    constructor(space_index)
    {
        // take a position as an index, and get the div associated with it
        this.currentSpace = document.getElementById(`box-${space_index}`)
        this.currentSpace.addEventListener('click', this.updateBoard.bind(this), false)
        this.state = BoardState.Empty
    }
    setState(newState)
    {   // when we set a new state, we need to update the div as well
        this.state = newState
        this.currentSpace.innerText = this.state
    }
    getState()
    {
        return this.state
    }
    updateBoard(event)
    {
        // do no update if we currently have a non Empty state
        if (this.state == BoardState.Empty)
        {
            // if the human input is not blocked, and we are getting input from a real human
            // or if the computer is making a play, only allow input from the computer
            if ((!humanHalt && event.pointerType != "") || (currentTurn == cpuPlayer && event.pointerType == "" && cpuGame))
            {
                // update the state / div and fade in the text
                this.setState(currentTurn)
                this.currentSpace.classList.add('fade')

                // flip flop player's turn in the global game state 
                if (currentTurn == BoardState.X)
                {
                    currentTurn = BoardState.O
                }
                else if (currentTurn == BoardState.O)
                {
                    currentTurn = BoardState.X
                }
                turnInfo.innerText = `Current Turn: ${currentTurn}`
            }
            // we need to block any human input while we are checking for a win
            // and while the CPU is making a play. it will be released either when 
            // it is done checking for a win, or after the CPU has made a play
            humanHalt = true
            this.board.checkForWin()

            // if the CPU is allowed to move, make a move
            // CPU placePiece() has access to the updateBoard(), so keep it from double 
            // updating the same piece by halting further execution until after it places 
            // the piece it wants
            if (cpuGame && cpuHalt == false)
            {
                console.log("making cpu move")
                if (currentTurn == cpuPlayer)
                {
                    cpuHalt = true
                    cpu.placePiece()
                }
            }
        }
        else
        {
            alert("There is a piece there already!")
        }
    }

    setBoard(board)
    {
        // we have to retroactively give the class access to the board
        // once the entire board has been created
        this.board = board
    }

    resetSpace()
    {
        // fade out all of the text and reset the states
        this.currentSpace.classList.remove("fade")
        setTimeout(() => {this.currentSpace.innerText = ""}, 500)
        this.state = BoardState.Empty   
    }
}

// store the total board conditions
class Board
{
    constructor(boardSpaces)
    {   // the board stores all of the BoardSpace objects
        this.boardSpaces = boardSpaces
    }
    checkForWin()
    {
        // split the board into all possible win vectors only once
        let possibleWinMethods = Board.splitBoard(this)

        // check each win vector
        for (let winMethod of possibleWinMethods)
        {   
            // if all of the win vectors are the same and are not empty
            if (winMethod[0].state == winMethod[1].state && 
                winMethod[1].state == winMethod[2].state && 
                winMethod[2].state != BoardState.Empty)
            {
                // change the color to show the winning vector
                winMethod[0].currentSpace.classList.add("win")
                winMethod[1].currentSpace.classList.add("win")
                winMethod[2].currentSpace.classList.add("win")
                
                // keep the CPU from continuing to try and place
                cpuHalt = true
                console.log("we have a winner!")

                // display that there is a winner
                let winResult = document.getElementById('win-result')
                let winMenu = document.getElementById('game-result')
                winResult.innerText = `${winMethod[0].state} Wins!`
                winMenu.classList.add('display-menu')
                
                // after 2 seconds, remove the win window and the win vector color change
                // as well as reset the state of the board
                setTimeout(() => 
                {
                    winMenu.classList.remove('display-menu')
                    this.clearBoard()
                    winMethod[0].currentSpace.classList.remove("win")
                    winMethod[1].currentSpace.classList.remove("win")
                    winMethod[2].currentSpace.classList.remove("win")
                }, 2000)
                
                // we found a win, so stop everything else
                return
            }
        }

        // if the board is filled and we haven't found a win
        if (this.isBoardFilled())
        {   
            // prevent the CPU from trying to place a piece
            // because there are no more spots left
            cpuHalt = true
            console.log("we have a tie!")

            // show the tie window and clear the board
            let winResult = document.getElementById('win-result')
            let winMenu = document.getElementById('game-result')
            winResult.innerText = "Tie!"
            winMenu.classList.add('display-menu')
            setTimeout(() => 
            {
                this.clearBoard()
                winMenu.classList.remove('display-menu')
            }, 2000)
        }

        // release the human halt after we have checked for win
        // in a CPU game, the CPU still has to make a move after this
        // so only release in human vs human game
        if (!cpuGame)
        {
            humanHalt = false
        }
    }

    isBoardFilled()
    {
        // see if all of the board spaces are filled up
        for (let boardSpace of this.boardSpaces)
        {
            // if any one space is empty, return false
            if (boardSpace.state == BoardState.Empty)
            {
                return false
            }
        }
        return true
    }

    clearBoard()
    {
        // reset each space
        for (let boardSpace of this.boardSpaces)
        {
            boardSpace.resetSpace()
        }
        // release any halts
        cpuHalt = false

        // once we clear, if the next turn is the CPU's
        // instruct it to take it
        if (currentTurn == cpuPlayer && cpuGame)
        {
            setTimeout(() => {cpu.placePiece()}, 1000)
        }
    }

    static splitBoard(board)
    {
        // split board into 2D array of possible ways to win (ie. [[0, 1, 2], [3, 4, 5], [6, 7, 8]] would
        // be the array representation of the possible winMethods for going across the board)
        let winMethods = []

        // win across
        winMethods.push([board.boardSpaces[0], board.boardSpaces[1], board.boardSpaces[2]])
        winMethods.push([board.boardSpaces[3], board.boardSpaces[4], board.boardSpaces[5]])
        winMethods.push([board.boardSpaces[6], board.boardSpaces[7], board.boardSpaces[8]])

        // win down
        winMethods.push([board.boardSpaces[0], board.boardSpaces[3], board.boardSpaces[6]])
        winMethods.push([board.boardSpaces[1], board.boardSpaces[4], board.boardSpaces[7]])
        winMethods.push([board.boardSpaces[2], board.boardSpaces[5], board.boardSpaces[8]])

        // win diagonal
        winMethods.push([board.boardSpaces[0], board.boardSpaces[4], board.boardSpaces[8]])
        winMethods.push([board.boardSpaces[2], board.boardSpaces[4], board.boardSpaces[6]])

        return winMethods
    }
    static generateBoardSpaces()
    {   
        // generate a list of 9 BoardSpaces
        let boardSpaces = []
        for (let currentSpaceIndex = 0; currentSpaceIndex < 9; currentSpaceIndex++)
        {
            boardSpaces.push(new BoardSpace(currentSpaceIndex))
        }
        // create a new board, and give each space a reference to the overall board
        let board = new Board(boardSpaces)
        for (let currentSpace of boardSpaces)
        {
            currentSpace.board = board
        }
        return boardSpaces
    }
}

class ComputerPlayer
{
    constructor(board, cpuLetter, humanLetter)
    {
        // give the CPU access to the board and store who is who in terms of letter
        this.board = board
        this.cpuLetter = cpuLetter
        this.humanLetter = humanLetter

    }
    placePiece()
    {
        // split the board into possible win methods so we only have to do this once
        let splitBoard = Board.splitBoard(this.board)

        // place the CPU piece after a random amount of time
        // so it seems somewhat more realistic
        let randomTime = generateRandomNumber(150, 750)
        setTimeout(() => {
        // here are the steps for playing tic tac toe in order of precedence
        // 1. check to see if we can win in one move
        // 2. check to see if our opponent can win in one move, and prevent them
        // 3. check to see if we can win in two moves. this means a winMethod has one of our letters and two empty spaces
        // 4. place a random piece
        if (!this.canWinInOneMove(splitBoard))
        {
            if (!this.canPreventWinInOneMove(splitBoard))
            {
                if (!this.canWinInTwoMoves(splitBoard))
                {
                    this.placeRandomPiece()
                }
            }
        }
        cpuHalt = false
        humanHalt = false}, randomTime)
        // once we complete our move and stop access the board
        // give back access to everyone
    }
    canWinInOneMove(splitBoard)
    {
        for (let winMethod of splitBoard)
        {
            // if no spaces are empty, there's no way to win in one move
            if (winMethod[0].state == BoardState.Empty || 
                winMethod[1].state == BoardState.Empty ||
                winMethod[2].state == BoardState.Empty)
            {
                // we already know that there is at least 1 empty space,
                // so if this win method has our letter in it twice, we can win
                if ((winMethod[0].state == winMethod[1].state && winMethod[0].state == this.cpuLetter)|| 
                    (winMethod[0].state == winMethod[2].state && winMethod[0].state == this.cpuLetter) ||
                    (winMethod[1].state == winMethod[2].state && winMethod[1].state == this.cpuLetter))
                {
                    // find the empty space and take it
                    for (let space of winMethod)
                    {
                        if (space.state == BoardState.Empty)
                        {
                            space.currentSpace.click()
                            return true
                        }
                    }
                }
            }
        }
        return false
    }
    canPreventWinInOneMove(splitBoard)
    {
        for (let winMethod of splitBoard)
        {
            // if two letters in a winMethod are our enemy, try to find an empty space and take it
            if ((winMethod[0].state == winMethod[1].state && winMethod[0].state == this.humanLetter)|| 
                (winMethod[0].state == winMethod[2].state && winMethod[0].state == this.humanLetter) ||
                (winMethod[1].state == winMethod[2].state && winMethod[1].state == this.humanLetter))
            {
                for (let space of winMethod)
                {
                    // if any space is empty, take it
                    if (space.state == BoardState.Empty)
                    {
                        space.currentSpace.click()
                        return true
                    }
                }
            }
        }
        return false
    }
    canWinInTwoMoves(splitBoard)
    {
        for (let winMethod of splitBoard)
        {
            // if we have one of our pieces in a row and two empty pieces next to it, take the empty piece
            if ((winMethod[0].state == this.cpuLetter && winMethod[1].state == BoardState.Empty && winMethod[2].state == BoardState.Empty) ||
                (winMethod[0].state == BoardState.Empty && winMethod[1].state == this.cpuLetter && winMethod[2].state == BoardState.Empty) ||
                (winMethod[0].state == BoardState.Empty && winMethod[1].state == BoardState.Empty && winMethod[2].state == this.cpuLetter))
            {
                while (true)
                {
                    // loop until we randomly pick an empty index so we are not always picking
                    // the same empty side
                    let randomIndex = generateRandomNumber(0, 2)
                    if (winMethod[randomIndex].state == BoardState.Empty)
                    {
                        winMethod[randomIndex].currentSpace.click()
                        return true
                    }
                }
            }
        }
        return false
    }
    placeRandomPiece()
    {
        // if the board is filled, we cannot place a piece
        while (!this.isBoardFilled)
        {
            // loop until we place a random piece at an empty position
            let randomIndex = generateRandomNumber(0, 8)
            if (this.board.boardSpaces[randomIndex].state == BoardState.Empty)
            {
                this.board.boardSpaces[randomIndex].currentSpace.click()
                return
            }
        }
    }
}

// inclusive random number generator
function generateRandomNumber(min, max)
{
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// get elements from HTML
let cpuButton = document.getElementById("cpu")
let humanButton = document.getElementById("human")
let changeButton = document.getElementById('change-mode')
let turnInfo = document.getElementById("current-turn")

let menu = document.getElementById("menu")
let info = document.getElementById("info")

// set event listeners
cpuButton.addEventListener('click', setupCPUGame)
humanButton.addEventListener('click', setupHumanGame)
changeButton.addEventListener('click', changeMode)

// set game state for a 1vCPU game
function setupCPUGame(event)
{
    console.log("cpu game")
    cpuGame = true
    cpuHalt = false
    info.style.visibility = "visible"
    menu.classList.remove("display-menu")
    event.preventDefault()
}

// set game state for a 1v1 game
function setupHumanGame(event)
{
    cpuGame = false
    cpuHalt = true
    menu.classList.remove("display-menu")
    info.style.visibility = "visible"
    event.preventDefault()
}

// when we change mode mid game, reset all game states
function changeMode(event)
{
    currentTurn = BoardState.X
    board.clearBoard()
    info.style.visibility = "hidden"
    menu.classList.add("display-menu")
}

// generate instances of board and cpu
let board = new Board(Board.generateBoardSpaces())
let cpu = new ComputerPlayer(board, cpuPlayer, humanPlayer)
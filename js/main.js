'use strict';

const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'];

const suits = ['c', 'd', 'h', 's'];

const values = {
    A: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    T: 10,
    J: 10,
    Q: 10,
    K: 10
};

let blackAlert = (elem) => {

    let popupEl = document.getElementById('popup');

    let popup = new Popup(popupEl, {
        width: 200,
        height: 150
    });

    let popupText = document.getElementById('popup-text');

    popupText.innerHTML = elem;
    popup.open();

};

let blackConfirm = () => {

    let popupElem = document.getElementById('confirm-popup');

    let popupConfirm = new Popup(popupElem, {
        width: 400,
        height: 200
    });

    popupConfirm.open();

};

// select view elements
let playerHandLabel = document.getElementById('playerHand');
let dealerHandLabel = document.getElementById('dealerHand');
let outcomeLabel = document.getElementById('outcome');
let scoreLabel = document.getElementById('score');
let playerValue = document.getElementById('playerHandValue');
let playerBet = document.getElementById('player-bet');
let clearBet = document.getElementById('clear-bet');
let betValue = 0;

let chip1 = document.getElementById('chip1');
chip1.bet = () => {
    if ((parseInt(scoreLabel.innerHTML) - betValue) >= 50) {
        betValue += 50;
        playerBet.innerHTML = betValue;
    }
}

let chip2 = document.getElementById('chip2');
chip2.bet = () => {
    if ((parseInt(scoreLabel.innerHTML) - betValue) >= 100) {
        betValue += 100;
        playerBet.innerHTML = betValue;
    }
}

let chip3 = document.getElementById('chip3');
chip3.bet = () => {
    if ((parseInt(scoreLabel.innerHTML) - betValue) >= 250) {
        betValue += 250;
        playerBet.innerHTML = betValue;
    }
}

let chip4 = document.getElementById('chip4');
chip4.bet = () => {
    if ((parseInt(scoreLabel.innerHTML) - betValue) >= 500) {
        betValue += 500;
        playerBet.innerHTML = betValue;
    }
}

let chips = [chip1, chip2, chip3, chip4];


for (let i = 0; i < chips.length; i++) {
    let betHandler = () => {
        if (outcomeLabel.innerHTML === 'Do you Hit or Stand?') {
            blackAlert('You cannot increase you bet during game!');
        } else if (outcomeLabel.innerHTML === 'New card dealt. Do you Hit or Stand?') {
            blackAlert('You cannot increase you bet during game!');
        } else {
            chips[i].bet();
        }
    }
    chips[i].addEventListener('click', betHandler);
};


class Game {
    constructor() {
        this.outcome = "";
        this.inPlay = false;
        this.score = 2000;
        this.playingDeck = [];
        this.playerHand = [];
        this.dealerHand = [];
    }

    deal(betValue) {

        this.score -= betValue;
        if (this.inPlay) {
            this.outcome = "You have lost your hand.";
            // this.score -= betValue;
            this.inPlay = false;
        } else {
            this.outcome = " ";
        }

        this.inPlay = true;
        this.playingDeck = new Deck();
        this.playerHand = new Hand();
        this.dealerHand = new Hand();
        this.playingDeck.shuffleDeck();


        let dealRounds = 0;
        while (dealRounds <= 1) {
            this.playerHand.addCard(this.playingDeck.dealCard())
            this.dealerHand.addCard(this.playingDeck.dealCard())
            dealRounds += 1;
        }


        this.outcome = "Do you Hit or Stand?";
        playerValue.innerHTML = this.playerHand.getValue();

        if (this.playerHand.getValue() === 21) {
            this.outcome = "You hit BlackJack, You win. New Deal?";
            this.score += betValue * 2;
            this.inPlay = false;

        }

        if (parseInt(scoreLabel.innerHTML) - betValue < 0) {
            this.outcome = "You don't have enough points :(";

            let clearGameBet = (callback) => {
                playerBet.innerHTML = '0';
                callback();
            }

            clearGameBet(blackConfirm);
            this.inPlay = false;
        } else if (betValue === 0 && parseInt(scoreLabel.innerHTML) === 0) {
            this.outcome = "You don't have enough points :(";

            let clearGameBet = (callback) => {
                playerBet.innerHTML = '0';
                callback();
            }

            clearGameBet(blackConfirm);

            this.inPlay = false;
        }

        this.updateView();
    }

    hit() {
        if (this.inPlay) {
            // deal another card
            this.playerHand.addCard(this.playingDeck.dealCard())
                // If players hand value is over 21, player busts
            if (this.playerHand.getValue() > 21) {
                this.outcome = "You have busted (" + this.playerHand.getValue() + "), dealer wins. New Deal?";
                this.inPlay = false;
                // this.score -= parseInt(betValue);
                playerValue.innerHTML = this.playerHand.getValue();
            } else {
                this.outcome = "New card dealt. Do you Hit or Stand?";
                playerValue.innerHTML = this.playerHand.getValue();
            }
        }
        this.updateView();
    }

    stand() {
        if (this.inPlay) {
            // dealer only draws when below 17 points
            while (this.dealerHand.getValue() < 17) {
                this.dealerHand.addCard(this.playingDeck.dealCard());
            }
            // if dealers hand value is over 21, dealer busts
            if (this.dealerHand.getValue() === 21) {
                this.outcome = "The dealer hits BlackJack, dealer wins. New Deal?";
                // this.score -= betValue;
                this.inPlay = false;
            } else if (this.dealerHand.getValue() > 21) {
                this.outcome = "Dealer have busted (" + this.dealerHand.getValue() + "), you win (" + this.playerHand.getValue() + ")! New Deal?";
                this.score += parseInt(betValue) * 2;
                // else if dealer did not bust
            } else {
                // if dealers hand is equal or higher to players hand, dealer wins
                if (this.dealerHand.getValue() > this.playerHand.getValue()) {
                    this.outcome = "Dealer (" + this.dealerHand.getValue() + ") wins with your hand (" + this.playerHand.getValue() + "). New Deal?";
                    // this.score -= parseInt(betValue);
                    // else the player draws
                } else if (this.dealerHand.getValue() == this.playerHand.getValue()) {
                    this.outcome = "You (" + this.playerHand.getValue() + ") draw with dealer's hand (" + this.dealerHand.getValue() + ")! New Deal?";
                    this.score += parseInt(betValue);
                    // else the dealer lose
                } else {
                    this.outcome = "You (" + this.playerHand.getValue() + ") win with dealer's hand (" + this.dealerHand.getValue() + ")! New Deal?";
                    this.score += parseInt(betValue) * 2;
                }
            }
            this.inPlay = false;
            this.updateView();
        }
    }

    updateView() {
        playerHandLabel.innerHTML = this.playerHand.showPlayerHand();
        if (this.inPlay) {
            dealerHandLabel.innerHTML = this.dealerHand.showDealerHand();
        } else {
            dealerHandLabel.innerHTML = this.dealerHand.showPlayerHand();
        }
        outcomeLabel.innerHTML = this.outcome;

        scoreLabel.innerHTML = this.score;
    }
}

class Card {
    constructor(suit, rank) {
        this.suit = suit;
        this.rank = rank;
    }
    getCard() {
        return this;
    }

    getRank() {
        return this.rank;
    }

    getSuit() {
        return this.suit;
    }

}


class Hand {

    constructor() {
        this.hand = [];
    }
    addCard(card) {
        return this.hand.push(card);
    }
    getValue() {

        let handValue = 0;
        let handWithAce = false;

        for (let i = 0; i < this.hand.length; i++) {
            let rank = this.hand[i].getRank();
            handValue += values[rank];
            if (rank === 'A') {
                handWithAce = true;
            }
        }

        if (!handWithAce) {
            return handValue;
        } else {
            if (handValue + 10 <= 21) {
                return handValue + 10;
            } else {
                return handValue;
            }
        }
    }

    showPlayerHand() {
        let printHand = "";
        for (let i = 0; i < this.hand.length; i++) {
            printHand = printHand + "<img src=\"img/cards/" + this.hand[i].rank + this.hand[i].suit + ".svg\">";
        }
        return printHand;
    }

    showDealerHand() {
        let printHand = "";
        for (let i = 0; i < this.hand.length - 1; i++) {
            printHand = printHand + "<img src=\"img/cards/X.svg\">";
        }
        printHand = printHand + "<img src=\"img/cards/" + this.hand[this.hand.length - 1].rank + this.hand[this.hand.length - 1].suit + ".svg\">";
        return printHand;
    }

}


class Deck {
    constructor() {
        this.deck = [];

        for (let i = 0; i < suits.length; i++) {

            for (let j = 0; j < ranks.length; j++) {

                let addedCard = new Card(suits[i], ranks[j]);
                this.deck.push(addedCard.getCard());

            }
        }
    }

    showDeck() {
        let deckString = "Deck contains: ";
        for (let i = 0; i < this.deck.length; i++) {
            deckString = deckString + this.deck[i].rank + this.deck[i].suit + ' ';
        }
        return deckString;
    }

    shuffleDeck() {
        return shuffleArray(this.deck);
    }

    dealCard() {
        let cardToDeal = this.deck.pop();
        return cardToDeal;
    }

}

let shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}



// create a game instance
let blackjack = new Game();

document.getElementById('deal').addEventListener('click', () => {
    if (betValue == 0 && parseInt(scoreLabel.innerHTML) != 0) {
        blackAlert('Make your bet please!')
    } else if(parseInt(scoreLabel.innerHTML) == 0){
    	playerBet.innerHTML = '0';
        blackConfirm();
    } else if ((parseInt(scoreLabel.innerHTML) < betValue)) {
        betValue = parseInt(scoreLabel.innerHTML);
        playerBet.innerHTML = betValue;
        blackjack.deal(betValue);
    } else if (outcomeLabel.innerHTML === 'Do you Hit or Stand?') {
        blackAlert('Finish your game please!')
    } else if (outcomeLabel.innerHTML === 'New card dealt. Do you Hit or Stand?') {
        blackAlert('Finish your game please!')
    } else {
        blackjack.deal(betValue)
    }
});

document.getElementById('hit').addEventListener('click', () => blackjack.hit());
document.getElementById('stand').addEventListener('click', () => blackjack.stand());

clearBet.addEventListener('click', () => {

    if (outcomeLabel.innerHTML === 'Do you Hit or Stand?') {
        blackAlert('You cannot clear your bet now!')
    } else if (outcomeLabel.innerHTML === 'New card dealt. Do you Hit or Stand?') {
        blackAlert('You cannot clear your bet now!')
    } else {

        betValue = 0;
        playerBet.innerHTML = betValue;

    }

})

let closePopup = document.getElementById('close-popups');

closePopup.addEventListener('click', () => {
    document.getElementById('confirm-popup').style.display = 'none';
    document.getElementById('confirm-popup').style.zIndex = '-9999';
})

document.getElementById('startGame').onclick = () => location.reload();

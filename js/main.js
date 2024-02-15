let app = new Vue({
    el: '#app',
    data: {
        columns: [
            { title: 'Столбец 1', maxCards: 3, cards: [] },
            { title: 'Столбец 2', maxCards: 5, cards: [] },
            { title: 'Столбец 3', maxCards: Infinity, cards: [] },
        ],
        newCardText: '',
        column1Blocked: false, // Переменная для отслеживания блокировки первого столбца
        column2Full: false, // Переменная для отслеживания переполнения второго столбца
    },
    mounted() {
        // Загрузка данных из localStorage при запуске
        if (localStorage.getItem('notes')) {
            this.columns = JSON.parse(localStorage.getItem('notes'));
            this.checkColumn2Full();
        }
    },
    methods: {
        addCard(column, withCheckboxes = false) {
            if (column.cards.length < column.maxCards) {
                const newCard = {
                    title: 'Новая заметка',
                    items: [
                        { text: 'Пункт списка 1', completed: withCheckboxes },
                        { text: 'Пункт списка 2', completed: withCheckboxes },
                        { text: 'Пункт списка 3', completed: withCheckboxes },
                    ],
                    completedDate: withCheckboxes ? new Date().toLocaleString() : null,
                };

                column.cards.push(newCard);
                this.saveToLocalStorage();

                if (column.title === 'Столбец 2') {
                    this.checkColumn2Full();
                }
            }
        },
        checkCompletion(card, column) {
            const completedCount = card.items.filter(item => item.completed).length;
            const totalItems = card.items.length;

            if (column.title === 'Столбец 1' && completedCount >= 1 && !this.column1Blocked) {
                this.moveCard(card, column, this.columns[1]);
            } else if (column.title === 'Столбец 1' && completedCount === 0 && !this.column1Blocked) {
                return; // Если ни один пункт не отмечен, ничего не делаем
            } else if (column.title === 'Столбец 2' && completedCount === totalItems) {
                this.moveCard(card, column, this.columns[2]);
            } else if (column.title === 'Столбец 2' && completedCount === 0) {
                this.moveCard(card, column, this.columns[0]); // Переносим обратно в первый столбец, если ни один пункт не отмечен
            } else if (column.title === 'Столбец 3' && completedCount < totalItems) {
                this.moveCard(card, column, this.columns[1]);
            }

            if (completedCount === totalItems) {
                card.completedDate = new Date().toLocaleString();
            }

            this.saveToLocalStorage();
        },



        moveCard(card, fromColumn, toColumn) {
            if (toColumn.cards.length < toColumn.maxCards) {
                fromColumn.cards.splice(fromColumn.cards.indexOf(card), 1);
                toColumn.cards.push(card);
            }
        },
        clearLocalStorage() {
            localStorage.removeItem('notes');
            this.columns.forEach(column => {
                column.cards = [];
            });
            this.column1Blocked = false;
            this.column2Full = false;
        },
        saveToLocalStorage() {
            localStorage.setItem('notes', JSON.stringify(this.columns));
        },
        checkColumn2Full() {
            if (this.columns[1].cards.length === this.columns[1].maxCards) {
                this.column1Blocked = true;
                this.column2Full = true;
            } else {
                this.column1Blocked = false;
                this.column2Full = false;
            }
        },
    },
});
let app = new Vue({
    el: '#app',
    data: {
        columns: [
            { title: 'ToDo', maxCards: 3, cards: [] },
            { title: '50%', maxCards: 5, cards: [] },
            { title: '100%', maxCards: Infinity, cards: [] },
        ],
        newCardText: '',
        column1Blocked: false, // Переменная для отслеживания блокировки первого столбца
        column2Full: false, // Переменная для отслеживания переполнения второго столбца
        newNoteTitle: '', // Заголовок новой заметки
        newNoteItems: ['', '', ''], // Пункты новой заметки
        showForm: false,

    },
    mounted() {
        // Загрузка данных из localStorage при запуске
        if (localStorage.getItem('notes')) {
            this.columns = JSON.parse(localStorage.getItem('notes'));
            this.checkColumn2Full();
        }
    },
    methods: {
        toggleForm() {
            this.showForm = !this.showForm; // Переключаем видимость формы при нажатии на кнопку
        },
        addNote() {
            const newCard = {
                title: this.newNoteTitle || 'Новая заметка',
                items: this.newNoteItems.map(text => ({ text, completed: false })),
                completedDate: null,
            };

            this.columns[0].cards.push(newCard);
            this.saveToLocalStorage();

            // Сброс формы и скрытие её после добавления заметки
            this.newNoteTitle = '';
            this.newNoteItems = ['', '', ''];
            this.showForm = false;
        },
        addCard(newCard) {
            if (this.columns[0].cards.length < 3) {
                this.columns[0].cards.push(newCard);
                this.saveToLocalStorage();

                // Сброс формы и скрытие её после добавления заметки
                this.newNoteTitle = '';
                this.newNoteItems = ['', '', ''];
                this.showForm = false;
            } else {
                // Set isFirstColumnFull to true to disable the form button
                this.isFirstColumnFull = true;
                // Handle case when the first column is full (you can show a message or take other actions)
            }
        },
        checkCompletion(card, column) {
            const completedCount = card.items.filter(item => item.completed).length;
            const totalItems = card.items.length;

            if (column.title === 'ToDo' && completedCount >= 1 && !this.column1Blocked) {
                this.moveCard(card, column, this.columns[1]);
            } else if (column.title === 'ToDo' && completedCount === 0 && !this.column1Blocked) {
                return; // Если ни один пункт не отмечен, ничего не делаем
            } else if (column.title === '50%' && completedCount === totalItems) {
                this.moveCard(card, column, this.columns[2]);
            } else if (column.title === '50%' && completedCount === 0) {
                this.moveCard(card, column, this.columns[0]); // Переносим обратно в первый столбец, если ни один пункт не отмечен
            } else if (column.title === '100%' && completedCount === totalItems) { // Заменим эту строку
                this.moveCard(card, column, this.columns[2]); // Переносим заметку в третий столбец, если все пункты отмечены
            } else if (column.title === '100%' && completedCount < totalItems) {
                this.moveCard(card, column, this.columns[1]);
            }

            if (completedCount === totalItems) {
                card.completedDate = new Date().toLocaleString();
            }

            this.saveToLocalStorage();
        },

        showAddNoteForm() {
            this.showForm = true;
        },
        addNote() {
            const newCard = {
                title: this.newNoteTitle || 'Новая заметка',
                items: this.newNoteItems.map(text => ({ text, completed: false })),
                completedDate: null,
            };

            this.columns[0].cards.push(newCard);
            this.saveToLocalStorage();

            // Сброс формы и скрытие её после добавления заметки
            this.newNoteTitle = '';
            this.newNoteItems = ['', '', ''];
            this.showForm = false;
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
    computed: {
        isColumn1Full() {
            return this.columns[0].cards.length >= 3;
        }
    },
    
});
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
        newNoteItems: ['', '', '', '', ''], // Пункты новой заметки
        showForm: false, //Это для проверки скрыта форма или нет

    },
    mounted() {
        // Загрузка данных из localStorage при запуске
        if (localStorage.getItem('notes')) {
            this.columns = JSON.parse(localStorage.getItem('notes'));
            this.checkColumn2Full();
        }
        this.checkColumn2Full();
    },
    methods: {
        toggleForm() {
            this.showForm = !this.showForm; // Переключаем видимость формы при нажатии на кнопку
        },

        checkCompletion(card, column) {
            const completedCount = card.items.filter(item => item.completed).length;
            const totalItems = card.items.length;

          

            if (column.title === 'ToDo') {
                if (completedCount >= 2 && totalItems === 3) {
                    this.moveCard(card, column, this.columns[1]);
                } else if (completedCount >= 2 && totalItems === 4) {
                    this.moveCard(card, column, this.columns[1]);
                } else if (completedCount >= 3 && totalItems === 5) {
                    this.moveCard(card, column, this.columns[1]);
                }
            } else if (column.title === '50%' && completedCount === 0) {
                this.moveCard(card, column, this.columns[0]);
            } else if (column.title === '50%' && completedCount === totalItems) {
                this.moveCard(card, column, this.columns[2]);
            } else if (column.title === '100%' && completedCount < totalItems) {
                this.moveCard(card, column, this.columns[1]);
            }

            if (completedCount === totalItems) {
                card.completedDate = new Date().toLocaleString();
            }

            this.saveToLocalStorage();
            this.checkColumn2Full();
        },



        addNote() {
            // Проверяем, что есть как минимум три пункта в заметке
            const totalItems = this.newNoteItems.filter(item => item.trim() !== '').length;
            if (totalItems < 3) {
                alert('Менее трёх пунктов нельзя заполнить.');
                return;
            }

            const newCard = {
                title: this.newNoteTitle || 'Новая заметка',
                items: this.newNoteItems
                    .map(text => text.trim())
                    .filter(text => text !== '')
                    .map(text => ({ text, completed: false })),
                completedDate: null,
            };

            this.columns[0].cards.push(newCard);
            this.saveToLocalStorage();

            // Сброс формы и скрытие её после добавления заметки
            this.newNoteTitle = '';
            this.newNoteItems = ['', '', '', '', ''];
            this.showForm = false;
        },

        moveCard(card, fromColumn, toColumn) {
            // Проверяем, что в третий столбец можно добавить карточку
            if (toColumn.cards.length < toColumn.maxCards) {
                // Удаляем карточку из текущего столбца
                fromColumn.cards.splice(fromColumn.cards.indexOf(card), 1);
                // Добавляем карточку в целевой столбец
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
                this.column2Full = true;
            } else {
                this.column2Full = false;
                // Поиск первой подходящей карточки в первом столбце
                const cardToMove = this.columns[0].cards.find(card => {
                    const completedCount = card.items.filter(item => item.completed).length;
                    const totalItems = card.items.length;
                    return (completedCount === 2 && totalItems === 3) ||
                        (completedCount === 2 && totalItems === 4) ||
                        (completedCount === 3 && totalItems === 5);
                });
                // Если есть подходящая карточка, переместить ее во второй столбец
                if (cardToMove) {
                    this.moveCard(cardToMove, this.columns[0], this.columns[1]);
                }
            }
            if (this.column2Full) {
                this.column1Blocked = this.columns[0].cards.some(card => {
                    const completedCount = card.items.filter(item => item.completed).length;
                    const totalItems = card.items.length;
                    return (completedCount === 2 && totalItems === 3) ||
                        (completedCount === 2 && totalItems === 4) ||
                        (completedCount === 3 && totalItems === 5);
                });
            } else {
                this.column1Blocked = false;
            }
        },



    },
    computed: {
        isColumn1Full() {
            return this.columns[0].cards.length >= 3;
        },

    },
    
});
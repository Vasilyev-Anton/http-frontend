// src/js/app.js
const addTicket = document.querySelector('.btn');
const ticketPad = document.querySelector('.ticket-pad');
const url = 'http://localhost:3031';
let cancel;
let submit;
const TICKET_FIELDS_HTML = `
  <div class="description linear">Краткое описание</div>
    <input class="descriptionName linear" type="text" name="name"/>
  <div class="description linear">Подробное описание</div>
    <textarea class="fullDescriptionName linear" name="description"></textarea>
`;
const TICKET_FORM_BUTTONS = `
  <div class="btn-block">
    <input class="cancel linear" type="button" value="Отмена" />
    <input class="submit linear" type="button" value="Ok" />
  </div>
`;

// Добавление тикета
addTicket.addEventListener('click', () => {
  ticketPad.insertAdjacentHTML(
    'beforeend',
    `<form class="create-ticket">
      <div class="correctPad">
        <div class="description head">Добавить тикет</div>
        ${TICKET_FIELDS_HTML}
        ${TICKET_FORM_BUTTONS}  
      </div>
    </form>`,
  );
  cancel = document.querySelector('.cancel');
  submit = document.querySelector('.submit');
  // Обработчик кнопки ОТМЕНА меню "ДОБАВИТЬ ТИКЕТ"
  cancel.addEventListener('click', () => {
    document.querySelector('.create-ticket').remove();
  });
  // Обработчик кнопки ОК меню "ДОБАВИТЬ ТИКЕТ"
  submit.addEventListener('click', (e) => {
    e.preventDefault();
    const createTicketForm = document.querySelector('.create-ticket');
    const shortDescription = document.querySelector('.descriptionName').value; // Короткое описание
    const fullDescription = document.querySelector('.fullDescriptionName').value; // Полное описание
    document.querySelector('.create-ticket').remove();
    const date = new Date();
    const nowDate = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
    const xhr = new XMLHttpRequest();
    let body = Array.from(createTicketForm.elements)
      .filter(({ name }) => name)
      .map(({ name, value }) => `${name}=${encodeURIComponent(value)}`)
      .join('&');
    body = `${body}&created=${encodeURIComponent(nowDate)}`;
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        ticketPad.insertAdjacentHTML(
          // добавляем новый тикет со значениями
          'beforeend',
          `<div class="ticket" data-id ="${xhr.responseText}">
            <div class="custom-checkbox"></div>
            <span class="name" name="name" data-fulldescription ="${fullDescription}">${shortDescription}</span>
            <div class="control-element">
              <span class="created" name="created">${nowDate}</span>
              <span class="circle">
                <img class="correct" src="./img/correct.png" alt="Редактирование" />
              </span>
              <span class="circle">
                <img class="delete" src="./img/delete.png" alt="Удаление" />
              </span>
            </div>
          </div>`,
        );
      }
    };
    xhr.open('POST', `${url}`);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send(body);
  });
});
// обработчики событий при клике на тикет
ticketPad.addEventListener('click', (e) => {
  // обработка клика на кастомном чекбоксе
  if (e.target.classList.contains('custom-checkbox')) {
    e.target.classList.toggle('checked');
    // Определяем, активен чекбокс или нет
    const isChecked = e.target.classList.contains('checked');
    // код для обновления статуса тикета в зависимости от состояния чекбокса
    const ticket = e.target.closest('.ticket'); // находим ближайший родительский элемент с классом .ticket
    const idTicket = ticket.dataset.id; // получаем его id
    const xhr = new XMLHttpRequest();
    const body = `id=${encodeURIComponent(idTicket)}&status=${encodeURIComponent(isChecked)}`;
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== 4) {
        console.log(xhr.readyState);
      }
    };
    xhr.open('PATCH', `${url}/?${body}`);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send();
  }
  // Удаление тикета
  if (e.target.classList.contains('delete')) {
    const targetTicket = e.target.closest('.ticket');
    ticketPad.insertAdjacentHTML(
      'beforeend',
      `<form class="delete-ticket">
        <div class="deletePad">
          <div class="description head">Удалить тикет?</div>
          <div class="description linear">
            Вы уверены, что хотите удалить тикет? Это действие необратимо.
          </div>
          ${TICKET_FORM_BUTTONS}
        </div>
      </form>`,
    );
    // Обработчик кнопки ОТМЕНА меню "УДАЛИТЬ ТИКЕТ"
    document.querySelector('.cancel').addEventListener('click', () => {
      document.querySelector('.delete-ticket').remove();
    });
    // Обработчик кнопки ОК меню "УДАЛИТЬ ТИКЕТ"
    document.querySelector('.submit').addEventListener('click', (el) => {
      // Проверяем и удаляем открытое описание тикета, если оно есть
      const fullDescriptionElement = document.querySelector('.fullDes');
      if (fullDescriptionElement) {
        fullDescriptionElement.remove();
      }
      el.preventDefault();
      const xhr = new XMLHttpRequest();
      const body = `id=${encodeURIComponent(targetTicket.dataset.id)}`;
      xhr.onreadystatechange = () => {
        if (xhr.readyState !== 4) {
          return;
        }
        if (xhr.readyState === 4) {
          targetTicket.remove();
          document.querySelector('.delete-ticket').remove();
        }
      };
      xhr.open('DELETE', `${url}/?${body}`);
      xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
      xhr.send();
    });
  } else if (e.target.classList.contains('correct')) {
    // Изменение тикета
    ticketPad.insertAdjacentHTML(
      'beforeend',
      `<form class="create-ticket">
        <div class="correctPad">
          <div class="description head">Изменить тикет</div>
          ${TICKET_FIELDS_HTML}
          ${TICKET_FORM_BUTTONS}
        </div>
      </form>`,
    );
    const ticketCorrectValue = e.target.closest('.ticket');
    // Значение поля Краткое содержание (при корректировке данных)
    document.querySelector('.descriptionName').value = ticketCorrectValue.querySelector('.name').textContent;
    // Значение поля Полное содержание (при корректировке данных)
    document.querySelector('.fullDescriptionName').value = ticketCorrectValue.querySelector('.name').dataset.fulldescription;
    const cancelCorrectDescription = document.querySelector(
      '.cancel',
    ); // кнопка Отмена
    const submitCorrectDescription = document.querySelector(
      '.submit',
    ); // кнопка Ок
    // Обработчик кнопки ОТМЕНА меню "ИЗМЕНИТЬ ТИКЕТ"
    cancelCorrectDescription.addEventListener('click', () => {
      document.querySelector('.create-ticket').remove();
    });
    // Обработчик кнопки ОК - (отправить изменения) меню "ИЗМЕНИТЬ ТИКЕТ"
    submitCorrectDescription.addEventListener('click', () => {
      // Значение поля Краткое содержание (при корректировке данных)
      ticketCorrectValue.querySelector('.name').textContent = document.querySelector('.descriptionName').value;
      // Значение поля Полное содержание (при корректировке данных)
      ticketCorrectValue.querySelector('.name').dataset.fulldescription = document.querySelector('.fullDescriptionName').value;
      const xhr = new XMLHttpRequest();
      const body = `id=${encodeURIComponent(
        ticketCorrectValue.dataset.id,
      )}&name=${encodeURIComponent(
        document.querySelector('.descriptionName').value,
      )}&description=${encodeURIComponent(
        document.querySelector('.fullDescriptionName').value,
      )}`;
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          document.querySelector('.create-ticket').remove();
        }
      };
      xhr.open('PUT', `${url}/?${body}`);
      xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
      xhr.send();
    });
  } else if (e.target.classList.contains('status')) {
    // Обработка чекбокс
    const checkBox = e.target.closest('.status');
    const ticketInToCheck = checkBox.closest('.ticket');
    const idTicket = ticketInToCheck.dataset.id;
    let conditionCheckBox;
    if (checkBox.checked) {
      conditionCheckBox = true;
    } else if (!checkBox.checked) {
      conditionCheckBox = false;
    }
    const xhr = new XMLHttpRequest();
    const body = `id=${encodeURIComponent(
      idTicket,
    )}&status=${encodeURIComponent(conditionCheckBox)}`;
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== 4) {
        console.log(xhr.readyState);
      }
    };
    xhr.open('PATCH', `${url}/?${body}`);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send();
  } else if (
    e.target.classList.contains('ticket')
    || e.target.classList.contains('name')
  ) {
    // обработка клика на тикет
    if (
      e.target.classList.contains('ticket')
      || e.target.classList.contains('name')
    ) {
      const ticket = e.target.closest('.ticket');
      const ticketFullDescription = ticket.querySelector('.name').dataset.fulldescription;
      if (ticketFullDescription && ticketFullDescription.trim() !== '') {
        if (!ticketPad.querySelector('.fullDes')) {
          ticket.insertAdjacentHTML(
            'afterEnd',
            `<div class="fullDes no-top-border">
                <span class="fullDes_content">${ticketFullDescription}</span>
            </div>`,
          );
          ticket.classList.add('no-bottom-border'); // Добавляем класс, когда открывается описание
        } else {
          ticketPad.querySelector('.fullDes').remove();
          const allTickets = ticketPad.querySelectorAll('.ticket');
          allTickets.forEach((tk) => tk.classList.remove('no-bottom-border'));
          ticket.classList.remove('no-bottom-border'); // Убираем класс, когда описание закрывается
        }
      }
    }
  }
});

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

// Получение списка тикетов
document.addEventListener('DOMContentLoaded', () => {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', `${url}/allTickets`);
  xhr.onload = () => {
    if (xhr.status === 200) {
      const tickets = JSON.parse(xhr.responseText);
      tickets.forEach((ticket) => {
        ticketPad.insertAdjacentHTML(
          'beforeend',
          `<div class="ticket" data-id ="${ticket.id}">
            <div class="custom-checkbox ${ticket.status ? 'checked' : ''}"></div>
            <span class="name" name="name" data-fulldescription ="${ticket.description}">${ticket.name}</span>
            <div class="control-element">
              <span class="created" name="created">${ticket.created}</span>
              <span class="circle">
                <img class="correct" src="./img/correct.png" alt="Редактирование" />
              </span>
              <span class="circle">
                <img class="delete" src="./img/delete.png" alt="Удаление" />
              </span>
            </div>
          </div>`,
        );
      });
    }
  };
  xhr.send();
});
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
  cancel.addEventListener('click', () => {
    document.querySelector('.create-ticket').remove();
  });
  submit.addEventListener('click', (e) => {
    e.preventDefault();
    const createTicketForm = document.querySelector('.create-ticket');
    const shortDescription = document.querySelector('.descriptionName').value;
    const fullDescription = document.querySelector('.fullDescriptionName').value;
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
    xhr.open('POST', `${url}/newTicket`);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send(body);
  });
});
ticketPad.addEventListener('click', (e) => {
  if (e.target.classList.contains('custom-checkbox')) {
    e.target.classList.toggle('checked');
    const isChecked = e.target.classList.contains('checked');
    const ticket = e.target.closest('.ticket');
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
    document.querySelector('.cancel').addEventListener('click', () => {
      document.querySelector('.delete-ticket').remove();
    });
    document.querySelector('.submit').addEventListener('click', (el) => {
      const fullDescriptionElement = document.querySelector('.fullDes');
      if (fullDescriptionElement) {
        fullDescriptionElement.remove();
      }
      el.preventDefault();
      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = () => {
        if (xhr.readyState !== 4) {
          return;
        }
        if (xhr.readyState === 4) {
          targetTicket.remove();
          document.querySelector('.delete-ticket').remove();
        }
      };
      const ticketId = encodeURIComponent(targetTicket.dataset.id);
      xhr.open('DELETE', `${url}/tickets/${ticketId}`);
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
    document.querySelector('.descriptionName').value = ticketCorrectValue.querySelector('.name').textContent;
    document.querySelector('.fullDescriptionName').value = ticketCorrectValue.querySelector('.name').dataset.fulldescription;
    const cancelCorrectDescription = document.querySelector('.cancel');
    const submitCorrectDescription = document.querySelector('.submit');
    cancelCorrectDescription.addEventListener('click', () => {
      document.querySelector('.create-ticket').remove();
    });
    submitCorrectDescription.addEventListener('click', () => {
      ticketCorrectValue.querySelector('.name').textContent = document.querySelector('.descriptionName').value;
      ticketCorrectValue.querySelector('.name').dataset.fulldescription = document.querySelector('.fullDescriptionName').value;
      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          document.querySelector('.create-ticket').remove();
        }
      };
      xhr.open('PUT', `${url}/updateTicket/${ticketCorrectValue.dataset.id}`);
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.send(JSON.stringify({
        name: document.querySelector('.descriptionName').value,
        description: document.querySelector('.fullDescriptionName').value,
      }));
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
          ticket.classList.add('no-bottom-border');
        } else {
          ticketPad.querySelector('.fullDes').remove();
          const allTickets = ticketPad.querySelectorAll('.ticket');
          allTickets.forEach((tk) => tk.classList.remove('no-bottom-border'));
          ticket.classList.remove('no-bottom-border');
        }
      }
    }
  }
});

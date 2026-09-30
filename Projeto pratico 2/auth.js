// ======================================================
// AUTH.JS — troca de abas (Entrar / Criar conta), validação
// campo a campo, e o botão de mostrar/esconder senha.
// Depende de shop.js já estar carregado antes (usa setLoggedUser).
// ======================================================

const tabs = document.querySelectorAll('.auth-tab');
const forms = {
  login: document.getElementById('loginForm'),
  signup: document.getElementById('signupForm'),
};

// Troca qual aba/formulário está visível
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab; // "login" ou "signup", vem do HTML

    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    Object.keys(forms).forEach(key => {
      forms[key].hidden = key !== target; // esconde todos, menos o da aba clicada
    });
  });
});

// ---------- BOTÃO DE MOSTRAR/ESCONDER SENHA ----------
document.querySelectorAll('.toggle-password').forEach(button => {
  button.addEventListener('click', () => {
    const input = document.getElementById(button.dataset.target);
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    button.textContent = isHidden ? 'esconder' : 'mostrar';
  });
});

// ---------- VALIDAÇÃO — helpers reutilizados pelos dois formulários ----------

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Marca (ou limpa) o erro de um campo: pinta a borda e escreve a mensagem
// embaixo. Passar mensagem vazia ('') limpa o estado de erro.
function setFieldError(inputId, message) {
  const input = document.getElementById(inputId);
  const errorEl = document.getElementById(inputId + 'Error');
  input.classList.toggle('invalid', Boolean(message));
  errorEl.textContent = message;
}

// ---------- FORMULÁRIO DE LOGIN ----------
forms.login.addEventListener('submit', (e) => {
  e.preventDefault(); // impede o recarregamento da página (não tem servidor pra enviar isso mesmo)

  const email = document.getElementById('loginEmail').value.trim();
  const senha = document.getElementById('loginSenha').value;

  let valid = true;

  if (!email) {
    setFieldError('loginEmail', 'Digite seu e-mail.');
    valid = false;
  } else if (!EMAIL_REGEX.test(email)) {
    setFieldError('loginEmail', 'Esse e-mail não parece válido.');
    valid = false;
  } else {
    setFieldError('loginEmail', '');
  }

  if (!senha) {
    setFieldError('loginSenha', 'Digite sua senha.');
    valid = false;
  } else {
    setFieldError('loginSenha', '');
  }

  if (!valid) return;

  // Como não existe um banco de usuários de verdade, qualquer combinação
  // preenchida corretamente é aceita — isso é só uma demonstração de front-end.
  setLoggedUser({ name: email.split('@')[0], email });
  showSuccessAndRedirect('loginForm');
});

// ---------- FORMULÁRIO DE CADASTRO ----------
forms.signup.addEventListener('submit', (e) => {
  e.preventDefault();

  const nome = document.getElementById('signupNome').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const senha = document.getElementById('signupSenha').value;
  const confirmar = document.getElementById('signupConfirmar').value;

  let valid = true;

  if (!nome) {
    setFieldError('signupNome', 'Digite seu nome.');
    valid = false;
  } else {
    setFieldError('signupNome', '');
  }

  if (!email) {
    setFieldError('signupEmail', 'Digite seu e-mail.');
    valid = false;
  } else if (!EMAIL_REGEX.test(email)) {
    setFieldError('signupEmail', 'Esse e-mail não parece válido.');
    valid = false;
  } else {
    setFieldError('signupEmail', '');
  }

  if (!senha) {
    setFieldError('signupSenha', 'Digite uma senha.');
    valid = false;
  } else if (senha.length < 6) {
    setFieldError('signupSenha', 'Use pelo menos 6 caracteres.');
    valid = false;
  } else {
    setFieldError('signupSenha', '');
  }

  if (!confirmar) {
    setFieldError('signupConfirmar', 'Confirme a senha.');
    valid = false;
  } else if (senha && confirmar !== senha) {
    setFieldError('signupConfirmar', 'As senhas não coincidem.');
    valid = false;
  } else {
    setFieldError('signupConfirmar', '');
  }

  if (!valid) return;

  setLoggedUser({ name: nome, email });
  showSuccessAndRedirect('signupForm');
});

// Mostra uma mensagem de sucesso dentro do formulário e manda pra home
// depois de um instante — dá tempo da pessoa ler o que aconteceu.
function showSuccessAndRedirect(formId) {
  const form = document.getElementById(formId);
  const msg = document.createElement('p');
  msg.className = 'auth-success';
  msg.textContent = 'Tudo certo! Redirecionando...';
  form.appendChild(msg);

  setTimeout(() => {
    window.location.href = 'index.html';
  }, 900);
}

// ---------- "ESQUECI MINHA SENHA" ----------
const forgotLink = document.getElementById('forgotPasswordLink');
const forgotPanel = document.getElementById('forgotPanel');

if (forgotLink && forgotPanel) {
  forgotLink.addEventListener('click', () => {
    forgotPanel.hidden = !forgotPanel.hidden;
  });

  // Se a pessoa trocar pra aba "Criar conta" enquanto o painel estiver aberto, esconde ele
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      if (tab.dataset.tab !== 'login') forgotPanel.hidden = true;
    });
  });

  document.getElementById('forgotSubmitBtn').addEventListener('click', () => {
    const email = document.getElementById('forgotEmail').value.trim();
    const successMsg = document.getElementById('forgotSuccessMsg');

    if (!email || !EMAIL_REGEX.test(email)) {
      setFieldError('forgotEmail', 'Digite um e-mail válido.');
      successMsg.hidden = true;
      return;
    }

    setFieldError('forgotEmail', '');
    // Mensagem propositalmente genérica (não confirma se o e-mail existe ou não) —
    // é assim que sistemas de verdade fazem isso, por segurança, pra não revelar
    // quais e-mails têm conta cadastrada.
    successMsg.hidden = false;
  });
}

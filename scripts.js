// Funções auxiliares para máscaras
function mascaraCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return cpf;
}

function mascaraTelefone(telefone) {
    telefone = telefone.replace(/\D/g, '');
    telefone = telefone.replace(/^(\d{2})(\d)/g, '($1) $2');
    telefone = telefone.replace(/(\d)(\d{4})$/, '$1-$2');
    return telefone;
}

// Carrinho de compras
const carrinho = {
    items: [],
    total: 0,
    
    init: function() {
        this.loadFromStorage();
        this.updateUI();
        this.setupEventListeners();
    },
    
    loadFromStorage: function() {
        const savedCart = localStorage.getItem('carrinho');
        if (savedCart) {
            const parsedCart = JSON.parse(savedCart);
            this.items = parsedCart.items;
            this.total = parsedCart.total;
        }
    },
    
    saveToStorage: function() {
        localStorage.setItem('carrinho', JSON.stringify({
            items: this.items,
            total: this.total
        }));
    },
    
    addItem: function(nome, preco, quantidade = 1) {
        const existingItem = this.items.find(item => item.nome === nome);
        
        if (existingItem) {
            existingItem.quantidade += quantidade;
        } else {
            this.items.push({
                nome,
                preco,
                quantidade
            });
        }
        
        this.calculateTotal();
        this.updateUI();
        this.saveToStorage();
        this.showNotification(`${nome} adicionado ao carrinho!`);
    },
    
    removeItem: function(index) {
        this.items.splice(index, 1);
        this.calculateTotal();
        this.updateUI();
        this.saveToStorage();
    },
    
    calculateTotal: function() {
        this.total = this.items.reduce((sum, item) => {
            return sum + (item.preco * item.quantidade);
        }, 0);
    },
    
    updateUI: function() {
        const cartCount = document.getElementById('cart-count');
        const cartTotal = document.getElementById('cart-total');
        const cartItemsList = document.getElementById('cart-items');
        
        const totalItems = this.items.reduce((sum, item) => sum + item.quantidade, 0);
        cartCount.textContent = totalItems;
        cartTotal.textContent = `R$ ${this.total.toFixed(2)}`;
        
        cartItemsList.innerHTML = '';
        
        if (this.items.length === 0) {
            cartItemsList.innerHTML = '<li class="list-group-item">Carrinho vazio</li>';
            return;
        }
        
        this.items.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.innerHTML = `
                <div>
                    <h6 class="my-0">${item.nome}</h6>
                    <small class="text-muted">${item.quantidade} x R$ ${item.preco.toFixed(2)}</small>
                </div>
                <span class="badge bg-primary rounded-pill">R$ ${(item.preco * item.quantidade).toFixed(2)}</span>
                <button class="btn btn-sm btn-outline-danger remove-item" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            cartItemsList.appendChild(li);
        });
    },
    
    setupEventListeners: function() {
        document.querySelectorAll('.btn-add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                const card = e.target.closest('.product-card');
                const nome = card.querySelector('h4').textContent;
                const precoText = card.querySelector('.product-price').textContent;
                const preco = parseFloat(precoText.replace('R$ ', '').replace(',', '.'));
                
                this.addItem(nome, preco);
            });
        });
        
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-item') || e.target.closest('.remove-item')) {
                const button = e.target.classList.contains('remove-item') ? e.target : e.target.closest('.remove-item');
                const index = parseInt(button.getAttribute('data-index'));
                this.removeItem(index);
            }
        });
        
        document.getElementById('finalizar-compra').addEventListener('click', () => {
            if (this.items.length === 0) {
                alert('Seu carrinho está vazio!');
                return;
            }
            
            alert(`Compra finalizada! Total: R$ ${this.total.toFixed(2)}\nObrigado por comprar conosco!`);
            this.items = [];
            this.total = 0;
            this.updateUI();
            this.saveToStorage();
        });
    },
    
    showNotification: function(message) {
        const notification = document.createElement('div');
        notification.className = 'notification alert alert-success';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 3000);
    }
};

// Contador de visitas
const visitCounter = {
    init: function() {
        this.count = localStorage.getItem('visitas') || 0;
        this.count++;
        localStorage.setItem('visitas', this.count);
        this.updateUI();
    },
    
    updateUI: function() {
        const counterElement = document.getElementById('visit-counter');
        if (counterElement) {
            counterElement.textContent = `Visitas: ${this.count}`;
        }
    }
};

// Temporizador para ofertas especiais
const offerTimer = {
    endTime: new Date().getTime() + 24 * 60 * 60 * 1000, // 24 horas a partir de agora
    
    init: function() {
        this.updateTimer();
        setInterval(() => this.updateTimer(), 1000);
    },
    
    updateTimer: function() {
        const now = new Date().getTime();
        const distance = this.endTime - now;
        
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        const timerElement = document.getElementById('offer-timer');
        if (timerElement) {
            timerElement.innerHTML = `
                <div class="offer-timer-box">${hours.toString().padStart(2, '0')}</div>:
                <div class="offer-timer-box">${minutes.toString().padStart(2, '0')}</div>:
                <div class="offer-timer-box">${seconds.toString().padStart(2, '0')}</div>
            `;
        }
    }
};

// Validação de formulários
const formValidator = {
    init: function() {
        this.setupFormValidation();
        this.setupInputMasks();
    },
    
    setupFormValidation: function() {
        const form = document.getElementById('formCliente');
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (this.validateForm()) {
                alert('Cadastro realizado com sucesso!');
                form.reset();
            }
        });
    },
    
    setupInputMasks: function() {
        const cpfInput = document.getElementById('cpf');
        if (cpfInput) {
            cpfInput.addEventListener('input', function() {
                this.value = mascaraCPF(this.value);
            });
        }
        
        const telefoneInput = document.getElementById('telefone');
        if (telefoneInput) {
            telefoneInput.addEventListener('input', function() {
                this.value = mascaraTelefone(this.value);
            });
        }
    },
    
    validateForm: function() {
        let isValid = true;
        const form = document.getElementById('formCliente');
        
        // Validação do nome
        const nome = form.querySelector('#nome');
        if (nome.value.trim() === '') {
            this.showError(nome, 'Por favor, insira seu nome completo');
            isValid = false;
        } else {
            this.clearError(nome);
        }
        
        // Validação do CPF
        const cpf = form.querySelector('#cpf');
        if (cpf.value.trim() === '' || cpf.value.length < 14) {
            this.showError(cpf, 'Por favor, insira um CPF válido');
            isValid = false;
        } else {
            this.clearError(cpf);
        }
        
        // Validação do endereço
        const endereco = form.querySelector('#endereco');
        if (endereco.value.trim() === '') {
            this.showError(endereco, 'Por favor, insira seu endereço');
            isValid = false;
        } else {
            this.clearError(endereco);
        }
        
        // Validação do telefone
        const telefone = form.querySelector('#telefone');
        if (telefone.value.trim() === '' || telefone.value.length < 14) {
            this.showError(telefone, 'Por favor, insira um telefone válido');
            isValid = false;
        } else {
            this.clearError(telefone);
        }
        
        // Validação do email
        const email = form.querySelector('#email');
        if (email.value.trim() === '' || !this.validateEmail(email.value)) {
            this.showError(email, 'Por favor, insira um email válido');
            isValid = false;
        } else {
            this.clearError(email);
        }
        
        // Validação dos termos
        const termos = form.querySelector('#termos');
        if (!termos.checked) {
            this.showError(termos, 'Você deve aceitar os termos');
            isValid = false;
        } else {
            this.clearError(termos);
        }
        
        return isValid;
    },
    
    validateEmail: function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    showError: function(input, message) {
        const formGroup = input.closest('.mb-3') || input.closest('.form-check');
        if (!formGroup) return;
        
        let errorElement = formGroup.querySelector('.invalid-feedback');
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'invalid-feedback';
            formGroup.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        input.classList.add('is-invalid');
        
        if (input.type === 'checkbox') {
            const label = formGroup.querySelector('label');
            if (label) {
                label.classList.add('text-danger');
            }
        }
    },
    
    clearError: function(input) {
        const formGroup = input.closest('.mb-3') || input.closest('.form-check');
        if (!formGroup) return;
        
        const errorElement = formGroup.querySelector('.invalid-feedback');
        if (errorElement) {
            errorElement.remove();
        }
        
        input.classList.remove('is-invalid');
        
        if (input.type === 'checkbox') {
            const label = formGroup.querySelector('label');
            if (label) {
                label.classList.remove('text-danger');
            }
        }
    }
};

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    carrinho.init();
    visitCounter.init();
    offerTimer.init();
    formValidator.init();
});
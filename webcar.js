// Chave usada para salvar e buscar os carros no localStorage
const STORAGE_KEY = "webcar_carros";

// Lista de carros que aparece quando o site é aberto pela primeira vez
const dadosPadrao = [
    {
        id: 1,
        nome: "Porsche 911",
        img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80",
        motor: "3.0 Turbo",
        potencia: "385 cv",
        vel: "293 km/h",
        preco: "1.500.000"
    },
    {
        id: 2,
        nome: "Chevrolet Camaro",
        img: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80",
        motor: "V8 6.2",
        potencia: "461 cv",
        vel: "290 km/h",
        preco: "50.000"
    },
    {
        id: 3,
        nome: "BMW M4",
        img: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80",
        motor: "3.0 Twin Turbo",
        potencia: "510 cv",
        vel: "300 km/h",
        preco: "900.000"
    },
    {
        id: 4,
        nome: "Bugatti Chiron",
        img: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&q=80",
        motor: "W16 8.0",
        potencia: "1500 cv",
        vel: "420 km/h",
        preco: "5.000.000"
    }
];


// Tenta carregar os carros salvos no navegador, senão usa a lista padrão
function carregarCarros() {
    const salvo = localStorage.getItem(STORAGE_KEY);
    return salvo ? JSON.parse(salvo) : [...dadosPadrao];
}

// Salva a lista atual de carros no localStorage do navegador
function salvarStorage(lista) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

// Lista de carros na memória, carregada assim que o script roda
let carros = carregarCarros();

// Guarda o id do carro sendo editado (null = modo de adição)
let editandoId = null;

// Guarda o id do carro que está aguardando confirmação de remoção
let deletandoId = null;


// Gera e exibe os cards dos carros na grade da página
function renderCards() {
    const grid  = document.getElementById("grid");

    // Pega o texto da busca e joga pra minúsculo
    const busca = document.getElementById("busca").value.trim().toLowerCase();

    // Filtra a lista se tiver algo digitado na busca, senão mostra tudo
    const lista = busca
        ? carros.filter(c => c.nome.toLowerCase().includes(busca))
        : carros;

    // Se a lista ficou vazia, exibe mensagem de estado vazio e para
    if (lista.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="icon"></div>
                <p>${busca
                    ? `Nenhum carro encontrado para "${busca}".`
                    : "Nenhum carro cadastrado. Clique em + Adicionar Carro."
                }</p>
            </div>`;
        return;
    }

    // Monta o HTML de cada card e joga tudo na grade de uma vez
    grid.innerHTML = lista.map(c => `
        <div class="card" id="card-${c.id}">
            <img src="${c.img}" alt="${c.nome}"
                 onerror="this.src='https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80'" />
            <div class="card-body">
                <h2>${c.nome}</h2>
                <ul class="card-specs">
                    <li><span class="label">Motor</span>${c.motor}</li>
                    <li><span class="label">Potência</span>${c.potencia}</li>
                    <li><span class="label">Vel. Máx.</span>${c.vel}</li>
                </ul>
                <span class="preco">R$ ${c.preco}/dia</span>
            </div>
            <div class="card-actions">
                <button class="btn btn-rent" onclick="alugar(${c.id})">Alugar Agora</button>
                <button class="btn btn-edit" onclick="abrirEdicao(${c.id})">✏️ Editar</button>
                <button class="btn btn-del"  onclick="pedirDelecao(${c.id})">🗑️ Remover</button>
            </div>
        </div>`).join("");
}


// Abre o modal de formulário — se receber um carro, entra em modo de edição
function abrirModal(carro = null) {
    // Guarda o id se for edição, ou deixa null para adição
    editandoId = carro ? carro.id : null;

    // Muda o título do modal de acordo com o modo
    document.getElementById("modalTitulo").textContent = carro ? "Editar Carro" : "Adicionar Carro";

    // Preenche os campos com os dados do carro ou deixa em branco
    document.getElementById("f-nome").value     = carro?.nome     || "";
    document.getElementById("f-img").value      = carro?.img      || "";
    document.getElementById("f-motor").value    = carro?.motor    || "";
    document.getElementById("f-potencia").value = carro?.potencia || "";
    document.getElementById("f-vel").value      = carro?.vel      || "";
    document.getElementById("f-preco").value    = carro?.preco    || "";

    // Exibe o modal e já foca no campo de nome
    document.getElementById("overlay").classList.add("open");
    document.getElementById("f-nome").focus();
}

// Busca o carro pelo id e abre o modal já preenchido com os dados dele
function abrirEdicao(id) {
    const carro = carros.find(c => c.id === id);
    if (carro) abrirModal(carro);
}

// Fecha o modal e limpa o id de edição
function fecharModal() {
    document.getElementById("overlay").classList.remove("open");
    editandoId = null;
}

// Fecha o modal se o clique foi direto no fundo escurecido, não no conteúdo
function fecharModalOverlay(e) {
    if (e.target.id === "overlay") fecharModal();
}

// Lê os campos do formulário e salva o carro (novo ou editado)
function salvarCarro() {
    // Pega o valor de cada campo e tira os espaços das pontas
    const nome     = document.getElementById("f-nome").value.trim();
    const img      = document.getElementById("f-img").value.trim();
    const motor    = document.getElementById("f-motor").value.trim();
    const potencia = document.getElementById("f-potencia").value.trim();
    const vel      = document.getElementById("f-vel").value.trim();
    const preco    = document.getElementById("f-preco").value.trim();

    // Nome e preço são obrigatórios — avisa e para se faltar
    if (!nome || !preco) {
        toast("  Preencha pelo menos o nome e o preço.");
        return;
    }

    if (editandoId !== null) {
        // Modo edição: acha o índice do carro e sobrescreve os dados
        const idx = carros.findIndex(c => c.id === editandoId);
        if (idx !== -1) {
            // Mantém a imagem antiga se o campo de URL ficou vazio
            carros[idx] = { ...carros[idx], nome, img: img || carros[idx].img, motor, potencia, vel, preco };
            salvarStorage(carros);
            renderCards();
            toast("  Carro atualizado com sucesso!");
        }
    } else {
        // Modo adição: gera um id novo maior que o maior existente
        const novoId   = carros.length ? Math.max(...carros.map(c => c.id)) + 1 : 1;
        const fallback = "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80";

        // Adiciona o novo carro no fim da lista, usando imagem padrão se necessário
        carros.push({ id: novoId, nome, img: img || fallback, motor, potencia, vel, preco });
        salvarStorage(carros);
        renderCards();
        toast("  Carro adicionado!");
    }

    // Fecha o modal depois de salvar
    fecharModal();
}


// Guarda o id do carro a remover e abre a caixa de confirmação
function pedirDelecao(id) {
    deletandoId = id;

    // Coloca o nome do carro na mensagem de confirmação
    const carro = carros.find(c => c.id === id);
    document.querySelector(".confirm-inner h4").textContent = `Remover "${carro?.nome}"?`;

    // Exibe a caixa de confirmação
    document.getElementById("confirmBox").classList.add("open");
}

// Roda quando o usuário confirma a remoção clicando em "Remover"
document.getElementById("confirmBtn").onclick = () => {
    if (deletandoId === null) return;

    // Remove o carro da lista filtrando pelo id
    carros = carros.filter(c => c.id !== deletandoId);
    salvarStorage(carros);
    renderCards();
    fecharConfirm();
    toast("  Carro removido.");
};

// Fecha a caixa de confirmação e limpa o id guardado
function fecharConfirm() {
    document.getElementById("confirmBox").classList.remove("open");
    deletandoId = null;
}


// Simula a solicitação de aluguel e avisa o usuário com um toast
function alugar(id) {
    const carro = carros.find(c => c.id === id);
    if (carro) toast(`  Solicitação de aluguel do ${carro.nome} enviada!`);
}


// Guarda o timer do toast para poder cancelar antes de criar um novo
let toastTimer;

// Mostra uma notificação flutuante que some depois de 3 segundos
function toast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("show");

    // Cancela o timer anterior se ainda estava rodando
    clearTimeout(toastTimer);

    // Agenda o desaparecimento do toast após 3 segundos
    toastTimer = setTimeout(() => el.classList.remove("show"), 3000);
}


// Escuta a tecla ESC para fechar qualquer modal ou confirmação aberta
document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
        fecharModal();
        fecharConfirm();
    }
});


// Roda assim que a página carrega e exibe os carros na grade
renderCards();

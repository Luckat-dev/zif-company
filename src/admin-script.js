// public/admin-script.js
import { supabase } from '../src/lib/supabase.js';

const PASSWORD = import.meta.env.ADMIN_PASSWORD;

const loginContainer = document.getElementById('login-container');
const adminContainer = document.getElementById('admin-container');

// MODAL DE NOTIFICATION GLOBAL
window.showNotification = (message, type = 'info') => {
  if (type === 'success') {
    const modal = document.getElementById('success-modal');
    const msgSpan = document.getElementById('global-success-message');
    if (modal && msgSpan) {
      msgSpan.textContent = message;
      modal.style.display = 'flex';
      setTimeout(() => {
        modal.style.display = 'none';
      }, 2000);
    } else {
      alert(message);
    }
  } else if (type === 'error') {
    const modal = document.getElementById('error-modal');
    const msgSpan = document.getElementById('global-error-message');
    if (modal && msgSpan) {
      msgSpan.textContent = message;
      modal.style.display = 'flex';
    } else {
      alert(message);
    }
  } else {
    alert(message);
  }
};

// MODALS GLOBAUX
window.showErrorModal = (message) => {
  window.showNotification(message, 'error');
};

window.closeGlobalErrorModal = () => {
  document.getElementById('error-modal').style.display = 'none';
};

window.showSuccessModal = (message) => {
  window.showNotification(message, 'success');
};

window.closeGlobalSuccessModal = () => {
  document.getElementById('success-modal').style.display = 'none';
};

// Gestion des onglets
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

function switchTab(tabId) {
  tabBtns.forEach(btn => btn.classList.remove('active'));
  tabContents.forEach(content => content.classList.remove('active'));
  document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
  document.getElementById(`${tabId}-tab`).classList.add('active');
}

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    switchTab(btn.dataset.tab);
  });
});

window.checkAuth = () => {
  if (localStorage.getItem('admin') === 'true') {
    loginContainer.style.display = 'none';
    adminContainer.style.display = 'block';
    window.loadMembersList();
    setTimeout(() => {
      const event = new CustomEvent('admin-authenticated');
      window.dispatchEvent(event);
    }, 100);
    return true;
  }
  return false;
};

window.login = async (password) => {
  if (password === PASSWORD) {
    localStorage.setItem('admin', 'true');
    loginContainer.style.display = 'none';
    adminContainer.style.display = 'block';
    window.loadMembersList();
    return true;
  }
  return false;
};

window.logout = () => {
  localStorage.removeItem('admin');
  location.reload();
};

window.uploadImage = async (file, folder = 'members') => {
  if (!file) return null;
  
  const fileName = Date.now() + '_' + file.name;
  const { error } = await supabase.storage
    .from('team-photos')
    .upload(folder + '/' + fileName, file);
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage
    .from('team-photos')
    .getPublicUrl(folder + '/' + fileName);
  return publicUrl;
};

window.loadMembersList = async () => {
  const { data: members } = await supabase
    .from('team')
    .select('*')
    .order('display_order', { ascending: true });
  
  const event = new CustomEvent('members-loaded', { detail: members });
  window.dispatchEvent(event);
};

window.addMember = async (memberData, photoFile) => {
  let photoUrl = null;
  if (photoFile) {
    photoUrl = await window.uploadImage(photoFile, 'members');
  }

  const { error } = await supabase.from('team').insert({
    name: memberData.name,
    role: memberData.role,
    bio: memberData.bio,
    whatsapp: memberData.whatsapp,
    display_order: memberData.order,
    photo_url: photoUrl
  });

  if (error) throw error;
  await window.loadMembersList();
};

window.updateMember = async (id, memberData, photoFile) => {
  let photoUrl = null;
  if (photoFile) {
    photoUrl = await window.uploadImage(photoFile, 'members');
  }

  const { error } = await supabase.from('team').update({
    name: memberData.name,
    role: memberData.role,
    bio: memberData.bio,
    whatsapp: memberData.whatsapp,
    display_order: memberData.order,
    photo_url: photoUrl
  }).eq('id', id);

  if (error) throw error;
  await window.loadMembersList();
};

window.deleteMember = async (id) => {
  const { error } = await supabase.from('team').delete().eq('id', id);
  if (error) throw error;
  await window.loadMembersList();
};

// ========== FONCTIONS PROJETS ==========

window.loadProjectsList = async () => {
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
  
  const event = new CustomEvent('projects-loaded', { detail: projects });
  window.dispatchEvent(event);
};

window.addProject = async (projectData, imageFile) => {
  let imageUrl = null;
  if (imageFile) {
    imageUrl = await window.uploadImage(imageFile, 'projects');
  }

  const { error } = await supabase.from('projects').insert({
    title: projectData.title,
    categorie: projectData.categorie,
    ville: projectData.ville,
    annee: projectData.annee,
    description: projectData.description,
    image_url: imageUrl
  });

  if (error) throw error;
  if (window.loadProjectsList) await window.loadProjectsList();
};

window.updateProject = async (id, projectData, imageFile) => {
  let imageUrl = null;
  if (imageFile) {
    imageUrl = await window.uploadImage(imageFile, 'projects');
  }

  const { error } = await supabase.from('projects').update({
    title: projectData.title,
    categorie: projectData.categorie,
    ville: projectData.ville,
    annee: projectData.annee,
    description: projectData.description,
    image_url: imageUrl
  }).eq('id', id);

  if (error) throw error;
  if (window.loadProjectsList) await window.loadProjectsList();
};

window.deleteProject = async (id) => {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw error;
  if (window.loadProjectsList) await window.loadProjectsList();
};

window.checkAuth();

window.onclick = (e) => {
  const errorModal = document.getElementById('error-modal');
  const successModal = document.getElementById('success-modal');
  if (e.target === errorModal) window.closeGlobalErrorModal();
  if (e.target === successModal) window.closeGlobalSuccessModal();
};

function resizeImages() {
  const images = document.querySelectorAll('.project-item img, .member-card img');
  images.forEach(img => {
    if (!img.hasAttribute('data-resized')) {
      img.style.width = '60px';
      img.style.height = '60px';
      img.style.minWidth = '60px';
      img.style.maxWidth = '60px';
      img.style.borderRadius = '10px';
      img.style.objectFit = 'cover';
      img.setAttribute('data-resized', 'true');
    }
  });
}

setTimeout(resizeImages, 100);
const resizeObserver = new MutationObserver(() => {
  resizeImages();
});
resizeObserver.observe(document.body, { childList: true, subtree: true });
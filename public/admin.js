// public/admin.js
(function() {
  const PASSWORD = "ZifAdmin2025";
  const loginSection = document.getElementById('login-section');
  const adminSection = document.getElementById('admin-section');
  
  // Fonction pour afficher la bonne section
  function showCorrectSection() {
    if (localStorage.getItem('admin') === 'true') {
      if (loginSection) loginSection.style.display = 'none';
      if (adminSection) adminSection.style.display = 'block';
      return true;
    } else {
      if (loginSection) loginSection.style.display = 'flex';
      if (adminSection) adminSection.style.display = 'none';
      return false;
    }
  }
  
  // Afficher immédiatement la bonne section
  showCorrectSection();
  
  // Configurer le bouton de connexion immédiatement (sans attendre Supabase)
  const loginBtn = document.getElementById('admin-login-btn');
  const passwordInput = document.getElementById('admin-password');
  const errorMsg = document.getElementById('login-error');
  
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      const enteredPassword = passwordInput ? passwordInput.value : '';
      if (enteredPassword === PASSWORD) {
        localStorage.setItem('admin', 'true');
        if (loginSection) loginSection.style.display = 'none';
        if (adminSection) adminSection.style.display = 'block';
        // Charger les données après connexion
        loadSupabaseAndData();
      } else {
        if (errorMsg) errorMsg.textContent = 'Mot de passe incorrect';
      }
    });
  }
  
  // Si déjà connecté, charger les données
  if (localStorage.getItem('admin') === 'true') {
    loadSupabaseAndData();
  }
  
  function loadSupabaseAndData() {
    if (window.supabaseLoading) return;
    window.supabaseLoading = true;
    
    const supabaseUrl = "https://hwiedciqmrcvdjyisjdb.supabase.co";
    const supabaseAnonKey = "sb_publishable_-dssraFBzOFrNGmUhseXXQ_87IQXSdl";
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
    script.onload = () => {
      const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
      window.supabaseClient = supabase;
      
      // Initialiser toutes les fonctions avec supabase
      initAdminFunctions(supabase);
      
      // Charger les données
      loadMembersList(supabase);
      loadProjectsList(supabase);
    };
    document.head.appendChild(script);
  }
  
  function initAdminFunctions(supabase) {
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
      const btn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
      if (btn) btn.classList.add('active');
      const tab = document.getElementById(`${tabId}-tab`);
      if (tab) tab.classList.add('active');
    }
    
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        switchTab(btn.dataset.tab);
      });
    });
    
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
      await loadMembersList(supabase);
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
      await loadMembersList(supabase);
    };
    
    window.deleteMember = async (id) => {
      const { error } = await supabase.from('team').delete().eq('id', id);
      if (error) throw error;
      await loadMembersList(supabase);
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
      await loadProjectsList(supabase);
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
      await loadProjectsList(supabase);
    };
    
    window.deleteProject = async (id) => {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      await loadProjectsList(supabase);
    };
    
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
  }
  
  async function loadMembersList(supabase) {
    const { data: members } = await supabase
      .from('team')
      .select('*')
      .order('display_order', { ascending: true });
    const event = new CustomEvent('members-loaded', { detail: members });
    window.dispatchEvent(event);
  }
  
  async function loadProjectsList(supabase) {
    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    const event = new CustomEvent('projects-loaded', { detail: projects });
    window.dispatchEvent(event);
  }
})();
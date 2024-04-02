function openModal(modalId, overlayId){
    document.getElementById(modalId).style.display = 'flex';
    document.getElementById(overlayId).style.display = 'flex';
    document.querySelector('body').style.overflow = "hidden";

    setTimeout(() =>{
        document.getElementById(modalId).style.opacity = '1';
        document.getElementById(overlayId).style.opacity = '1';    
    }, 100);

}

function closeModal(modalId, overlayId) {
    document.getElementById(modalId).style.opacity = '0';
    document.getElementById(overlayId).style.opacity = '0'; 
    setTimeout(() =>{  
        document.getElementById(modalId).style.display = 'none';
        document.getElementById(overlayId).style.display = 'none';
        document.querySelector('body').style.overflow = "auto";
    }, 200);
}

function closeSecondaryModal(modalId, overlayId){
    document.getElementById(modalId).style.opacity = '0';
    document.getElementById(overlayId).style.opacity = '0'; 
    setTimeout(() =>{  
        document.getElementById(modalId).style.display = 'none';
        document.getElementById(overlayId).style.display = 'none';
    }, 200);
}


// UNUSED
function closeOpenModal(modalId, overlayId) {
    document.getElementById(modalId).style.display = 'none';
    document.getElementById(overlayId).style.display = 'none';
    var openModal = modalId + 'apply';
    var openOverlay = overlayId + 'apply';
    document.getElementById(openModal).style.display = 'flex';
    document.getElementById(openOverlay).style.display = 'flex';
}

// help-feature.js - Help button with AI-generated talking points

export function setupHelpButton(dom, state) {
  const helpModal = document.getElementById('helpModal');
  const helpClose = document.getElementById('helpClose');
  const getHelpBtn = document.getElementById('getHelpBtn');
  const helpContent = document.getElementById('helpContent');
  
  if (!helpModal) {
    console.error('Help modal not found!');
    return;
  }
  
  // Setup modal close handlers
  if (helpClose) {
    helpClose.addEventListener('click', () => {
      helpModal.classList.remove('active');
      helpModal.classList.add('hidden');
    });
  }
  
  // Get AI help
  if (getHelpBtn) {
    getHelpBtn.addEventListener('click', async () => {
      await generateHelp(state, helpContent);
    });
  }
  
  // Close on background click
  helpModal.addEventListener('click', (e) => {
    if (e.target === helpModal) {
      helpModal.classList.remove('active');
      helpModal.classList.add('hidden');
    }
  });
  
  // Setup help button with setInterval
  let helpButtonAttached = false;
  const checkInterval = setInterval(() => {
    const helpBtn = document.getElementById('helpBtn');
    if (helpBtn && !helpButtonAttached) {
      console.log('Help button found - attaching listener');
      helpBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Help button clicked - opening modal');
        helpModal.classList.remove('hidden');
        helpModal.classList.add('active');
      });
      helpButtonAttached = true;
      clearInterval(checkInterval);
    }
  }, 100);
  
  // Stop checking after 10 seconds
  setTimeout(() => {
    clearInterval(checkInterval);
  }, 10000);
  
  console.log('Help feature initialized');
}

async function generateHelp(state, helpContent) {
  if (!state.topic) {
    helpContent.innerHTML = '<p class="help-error">No topic selected yet!</p>';
    return;
  }
  
  helpContent.innerHTML = '<div class="loading">Generating talking points...</div>';
  
  try {
    const response = await fetch('/api/get-help', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: state.topic,
        stance: state.stance,
        messages: state.messages.slice(-3)
      })
    });
    
    const data = await response.json();
    
    if (data.success && data.help) {
      displayHelp(helpContent, data.help);
    } else {
      helpContent.innerHTML = '<p class="help-error">Could not generate help. Please try again.</p>';
    }
  } catch (error) {
    console.error('Help generation error:', error);
    helpContent.innerHTML = '<p class="help-error">Error generating help. Please try again.</p>';
  }
}

function displayHelp(container, helpData) {
  let html = '<div class="help-response">';
  
  if (helpData.openingLines && helpData.openingLines.length > 0) {
    html += '<div class="help-section">';
    html += '<h3>Opening Lines:</h3>';
    html += '<ul>';
    helpData.openingLines.forEach(line => {
      html += `<li>"${line}"</li>`;
    });
    html += '</ul>';
    html += '</div>';
  }
  
  if (helpData.talkingPoints && helpData.talkingPoints.length > 0) {
    html += '<div class="help-section">';
    html += '<h3>Key Points to Make:</h3>';
    html += '<ul>';
    helpData.talkingPoints.forEach(point => {
      html += `<li>${point}</li>`;
    });
    html += '</ul>';
    html += '</div>';
  }
  
  if (helpData.counterArguments && helpData.counterArguments.length > 0) {
    html += '<div class="help-section">';
    html += '<h3>How to Respond:</h3>';
    html += '<ul>';
    helpData.counterArguments.forEach(arg => {
      html += `<li>${arg}</li>`;
    });
    html += '</ul>';
    html += '</div>';
  }
  
  html += '</div>';
  container.innerHTML = html;
}

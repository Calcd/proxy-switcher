/* globals app, ui, proxy */
'use strict';

var profile = {};

document.addEventListener('click', ({target}) => {
  const cmd = target.dataset.cmd;
  if (cmd === 'delete-profile') {
    const profile = ui.manual.profile.value;
    chrome.storage.local.remove('profile.' + profile);
    chrome.storage.local.get({
      profiles: []
    }, prefs => {
      const index = prefs.profiles.indexOf(profile);
      if (index !== -1) {
        prefs.profiles.splice(index, 1);
        chrome.storage.local.set(prefs, () => {
          // updating list
          app.emit('profiles-updated');
          // updating buttons status
          ui.manual.profile.dataset.value = '';
          ui.manual.profile.dispatchEvent(new Event('keyup', {
            bubbles: true
          }));
        });
      }
    });
  }
  else if (cmd === 'set-manual') {
    chrome.storage.local.get({
      profiles: []
    }, prefs => {
      const profile = ui.manual.profile.value;
      prefs.profiles.push(profile);
      prefs.profiles = prefs.profiles.filter((n, i, l) => n && l.indexOf(n) === i);
      prefs['profile.' + profile] = proxy.manual();
      chrome.storage.local.set(prefs, () => {
        // updating list
        app.emit('profiles-updated');
        // updating buttons status
        ui.manual.profile.dataset.value = profile;
        ui.manual.profile.dispatchEvent(new Event('keyup', {
          bubbles: true
        }));
      });
    });
  }
});

profile.search = (config, callback) => {
  const json = JSON.stringify(config);
  chrome.storage.local.get(null, prefs => {
    const name = (prefs.profiles || []).filter(p => JSON.stringify(prefs['profile.' + p]) === json).shift();
    callback(name);
  });
};

// updating manual -> profiles
app.on('profiles-updated', () => chrome.storage.local.get({
  profiles: []
}, prefs => {
  ui.manual.profiles.textContent = '';
  prefs.profiles.forEach(profile => {
    const option = document.createElement('option');
    option.value = profile;
    ui.manual.profiles.appendChild(option);
  });
}));
app.emit('profiles-updated');

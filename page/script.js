document.addEventListener("DOMContentLoaded", () => {
  const inputs = document.querySelectorAll("input[data-panel]");

  // Load config.json on page load
  fetch("config.json")
    .then(res => res.json())
    .then(config => {
      inputs.forEach(input => {
        let panel = input.dataset.panel;
        let key = input.dataset.key;
        if (config[panel] && config[panel][key]) {
          input.value = config[panel][key];
        }
      });
    })
    .catch(() => console.log("No config yet."));

  // Save on input change
  inputs.forEach(input => {
    input.addEventListener("change", () => {
      let panel = input.dataset.panel;
      let key = input.dataset.key;
      let value = input.value;

      fetch("save_config.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ panel, key, value })
      });
    });
  });
});


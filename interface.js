//Jquery. plz replace with basic javascript from here out
$(function() {
  var lastAccordion = 0;
  $("#content").accordion({
    active: 6,
    collapsible: true,
    heightStyle: 'content',
    animate: {
      easing: 'linear',
      duration: 100,
    },
    activate: function(event, ui) {
      var active = $("#content").accordion("option", "active");
      if (active === false && lastAccordion == 6) {
        $("#content").accordion("option", "active", 6);
        krunchit();
      } else if (active === false && lastAccordion == 7) {
        parseImport();
        $("#content").accordion("option", "active", 7);
      } else if (active === false && lastAccordion === 0) {
        flipArmy();
        $("#content").accordion("option", "active", 0);
      } else if (active == 7) {
        if (!active_army) {
          document.getElementById('importButton').innerHTML = 'Tap to Import Attacker';
        } else {
          document.getElementById('importButton').innerHTML = 'Tap to Import Defender';
        }
      } else if (active == 6) {
        document.getElementById('simulateButton').innerHTML = 'Tap to Simulate';
      } else if (active === false) {
        $("#content").accordion("option", "active", 6);
      }
      if (!active_army) {
        document.getElementById('statlinesButton').innerHTML = '⚔️ Statlines ⚔️';
      } else {
        document.getElementById('statlinesButton').innerHTML = '🛡️ Statlines 🛡️';
      }
    },
    beforeActivate: function(event, ui) {
      lastAccordion = $("#content").accordion("option", "active");
      if (lastAccordion == 7) {
        document.getElementById('importButton').innerHTML = 'Import';
      } else if (lastAccordion == 6) {
        document.getElementById('simulateButton').innerHTML = 'Simulation';
      }
    }
  });
  $(document).tooltip({
    show: {
      delay: 1500,
      duration: 500
    },
    hide: {
      delay: 0,
      duration: 0
    }
  });
});

var dragTarget;
var startValue;
var startPos;

// for (spinner of document.getElementsByClassName('*')) {
//   spinner.addEventListener("mousedown", spinnerDrag);
// }

for (mod of document.getElementsByClassName('mod')) {
  let checkBox = mod.getElementsByClassName('selectMod');
  if (checkBox[0]) {
    mod.addEventListener('click', function() {
      checkBox[0].checked = !checkBox[0].checked;
    });
  }
}

for (spinner of document.getElementsByClassName('spinner')) {
  spinner.addEventListener("mousedown", spinnerDown);
  spinner.addEventListener("touchstart", spinnerDown);
}

document.body.addEventListener("mousemove", spinnerDrag);
document.body.addEventListener("mouseup", spinnerUp);
document.body.addEventListener("touchmove", spinnerDrag);
document.body.addEventListener("touchend", spinnerUp);
document.body.addEventListener("touchcancel", spinnerUp);

function spinnerDown(e) {
  dragTarget = e.currentTarget
  startValue = Number(dragTarget.value)
  startPos = Number(e.clientY || e.targetTouches[0].pageY)
}

function spinnerUp(e) {
  dragTarget = null;
}

function spinnerDrag(e) {
  if (dragTarget) {
    let drag = e.clientY || e.targetTouches[0].pageY;
    dragTarget.value = startValue - Math.floor((drag - startPos) / 40);
  }
}

//
function openNav(navDiv) {
  document.getElementById(navDiv).style.width = "100%";
  document.getElementById(navDiv).style.backgroundColor = "#332211";
  for (bar of Array.from(document.getElementsByClassName('sidenav')).concat(Array.from(document.getElementsByClassName('sidenav')))) {
    bar.style.opacity = '1';
  }
}

function closeNav() {
  for (bar of document.getElementsByClassName('sidenav')) {
    bar.style.width = "0";
    bar.style.backgroundColor = "#000000";
    // bar.style.opacity = '0';
  }
  for (bar of Array.from(document.getElementsByClassName('sidenav')).concat(Array.from(document.getElementsByClassName('sidenav')))) {
    bar.style.opacity = '0';
  }
}

function populateNav(navDiv) {
  //We will populate the current army later
  let currentArmy;
  let atkrdfdr;
  // Grab the correct sidebar
  let sideBarNav = document.getElementById(navDiv)
  //Create a close button
  let closeButton = document.createElement('a');
  closeButton.appendChild(document.createTextNode("×"));
  closeButton.classList.add('closebtn');
  //Get the side of screen you will be viewing
  //And populate the current army with the correct side
  if (navDiv == 'leftSidenav') {
    closeButton.classList.add('leftPos');
    currentArmy = atkr_army;
    atkrdfdr = 'attacker';
    var currentNav = document.getElementsByClassName('sidenav')[0];
  } else {
    closeButton.classList.add('rightPos');
    currentArmy = dfdr_army;
    atkrdfdr = 'defender';
    var currentNav = document.getElementsByClassName('sidenav')[1];
  }
  closeButton.href = 'javascript:void(0)';
  closeButton.setAttribute('onclick', 'closeNav(this.parentNode)');
  //Clear old data from sidebar
  sideBarNav.innerHTML = '';
  if (!currentArmy.units.length) {
    // let newTextarea = document.createElement('textarea');
    // newTextarea.classList.add('importer')
    // currentNav.appendChild(newTextarea)
    // currentNav.innerHTML += '<textarea name="importBox" id="importBox" class="importer" rows="8" cols="38" placeholder="In Battlescribe, View a unit, switch the view type to \'Markdown\', and copy/paste into this box. Then hit \'Import\' again.">'
  }
  //Declare the units and models trackers
  let newUnit, newModel;
  //Loop through every unit in the army
  currentArmy.units.forEach((unit, i) => {
    newUnit = document.createElement('div');
    newUnit.classList.add('unitNav');
    newUnit.appendChild(document.createTextNode(unit.name));
    newUnit.addEventListener("click", function() {
      if (this.getElementsByClassName('abilNav').length) {
        for (var abilNode of this.getElementsByClassName('abilNav')) {
          abilNode.parentNode.removeChild(abilNode);
        }
      } else {
        //     for (var tag of document.getElementsByClassName('tag')) {
        //             tag.style = 'visibility: hidden; height: 0; margin: 0;'
        //     }
        let newAbil = document.createElement('div')
        newAbil.classList.add('abilNav');
        unit.abilities.forEach((abil, i) => {
          let ability = document.createElement('div');
          ability.appendChild(document.createTextNode(abil));
          ability.classList.add('tag', 'abilTag')
          newAbil.appendChild(ability);
        });
        unit.rules.forEach((rule, i) => {
          let newRule = document.createElement('div');
          newRule.appendChild(document.createTextNode(rule));
          newRule.classList.add('tag', 'ruleTag')
          newAbil.appendChild(newRule);
        });
        console.log(unit);
        unit.weaponQty.forEach((weap, i) => {
          let newWeap = document.createElement('div');
          newWeap.appendChild(document.createTextNode(Object.keys(weap)[0] + " x" + weap[Object.keys(weap)[0]]));
          newWeap.classList.add('tag', 'weapTag')
          newAbil.appendChild(newWeap);
        });
        this.appendChild(newAbil);
      }
    });
    unit.models.forEach((model, j) => {
      newModel = document.createElement('div');
      newModel.setAttribute("onclick", 'closeNav()');
      newModel.classList.add('modelNav');
      let newName = document.createElement('div');
      newName.classList.add('modelName');
      // newName.appendChild(document.createTextNode(model.name + " x" + unit.modelQty.find(element => element[model.name])[model.name]));
      newName.appendChild(document.createTextNode(model.name));
      newModel.appendChild(newName);
      newModel.appendChild(document.createElement('br'));
      for (stat in model.statlines) {
        let newStat = document.createElement('div');
        newStat.appendChild(document.createTextNode(stat + " " + model.statlines[stat] + " "));
        newStat.classList.add('tag')
        newModel.appendChild(newStat);
      }
      newModel.addEventListener("click", function() {
        loadModel(model);
      });
      newUnit.appendChild(newModel);
    });
    sideBarNav.appendChild(newUnit);
  });
  sideBarNav.appendChild(closeButton);
}

var exerciseType = 'truthTable'

function addSymbol(symbol) {
    document.getElementById("equation").value += symbol;
}

function openTab(evt, tabName) {
    var i, tabcontent, tablinks, contents;
    exerciseType = tabName;
    document.getElementById("name").value = "";
    document.getElementById("atomics").value = "";
    document.getElementById("type").value = tabName;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}
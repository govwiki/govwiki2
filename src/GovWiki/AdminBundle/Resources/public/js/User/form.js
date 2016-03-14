$(function() {
    var selectRoles = $('#govwiki_admin_form_user_roles')[0];
    var selectEnvs = $('#govwiki_admin_form_user_environments')[0];
    var optionsList = selectRoles.options;

    // Hide Environments selection if ROLE_MANAGER is not selected
    for (var i = 0; i < optionsList.length; i++) {
        var option = optionsList[i];
        if ('ROLE_MANAGER' == option.value && !option.selected) {
            $(selectEnvs.parentNode).hide();
        }
    }

    // Show/Hide Environments selection on ROLE_MANAGER is selected/not selected
    $(selectRoles).on('change', function () {
        for (var i = 0; i < optionsList.length; i++) {
            var option = optionsList[i];
            if ('ROLE_MANAGER' == option.value) {
                if (option.selected) {
                    $(selectEnvs.parentNode).show();
                    break;
                } else {
                    $(selectEnvs.parentNode).hide();
                    for (var j = 0; j < selectEnvs.options.length; j++) {
                        selectEnvs.options[j].selected = false;
                    }
                    break;
                }
            }
        }
    });
});
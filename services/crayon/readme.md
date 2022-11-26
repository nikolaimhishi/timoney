............................................................................................................... TEMPLATES


############################################
#LIST       - must have closest data-object
############################################

<ul data-list='person.stories.saved'></ul>

###########################################
#OBJECT     - no scoping required
###########################################

<li data-object='{{post._id}}'>{{>story}}</li>


###########################################
#KEY        - must have closest data-object
###########################################

<span data-key='creator.name'>{{creator.name}}</span>


............................................................................................................... REQUESTS

##########################################
#NAVIGATING     @pending|success|error
##########################################

<button formmethod='get|post|put|patch|delete' formaction='#state|page.html?user=123' cache='true'></button>


#########################################
#FORMING        @pending|success|error
#########################################

<form method='get|post|put|patch|delete' action='endpoint.com' cache='true'></form>
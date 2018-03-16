 <% if(anti_playlist != undefined){
        anti_playlist.tracks.forEach(function(records, index){ %>
                $("#fadeOut").click(function() {
                    $("#track<%=index%>").fadeOut("slow", function() {
                        console.log('Faded')
                    });
                });
    <%}) }%>
               
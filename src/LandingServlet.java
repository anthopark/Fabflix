import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import javax.annotation.Resource;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.sql.DataSource;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

@WebServlet(name = "LandingServlet", urlPatterns = "/api/landing")
public class LandingServlet extends HttpServlet {
    @Resource(name = "jdbc/moviedb")
    private DataSource dataSource;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {

        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        JsonObject jsonResponse = new JsonObject();

        HttpSession session = request.getSession();
        User loggedInUser = (User) session.getAttribute("user");

        if (loggedInUser != null) {
            jsonResponse.addProperty("userEmail", loggedInUser.getUserEmail());
        }

        try {
            Connection dbcon = dataSource.getConnection();

            ResultSet genreResults = retrieveAllGenres(dbcon);

            JsonArray genreJsonArray = new JsonArray();

            while (genreResults.next()) {
                String genreName = genreResults.getString("name");
                String genreId = genreResults.getString("id");

                JsonObject genreObject = new JsonObject();
                genreObject.addProperty("genreName", genreName);
                genreObject.addProperty("genreId", genreId);
                genreJsonArray.add(genreObject);
            }

            jsonResponse.add("genres", genreJsonArray);

            out.write(jsonResponse.toString());
            genreResults.close();
        }  catch (Exception e) {
            e.printStackTrace();
            JsonObject jsonObject = new JsonObject();
            jsonObject.addProperty("errorMessage", e.getMessage());
            out.write(jsonObject.toString());

            response.setStatus(500);
        }

        out.close();
    }

    private ResultSet retrieveAllGenres(Connection dbcon)
        throws java.sql.SQLException {
        String query = "select * from genres;";
        PreparedStatement statement = dbcon.prepareStatement(query);

        return statement.executeQuery();
    }
}
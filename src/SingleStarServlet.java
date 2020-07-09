import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import javax.annotation.Resource;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

@WebServlet(name = "SingleStarServlet", urlPatterns = "/api/single-star")
public class SingleStarServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    // Create a dataSource which registered in web.xml
    @Resource(name = "jdbc/moviedb")
    private DataSource dataSource;

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");

        String starId = request.getParameter("id");

        PrintWriter out = response.getWriter();

        try {

            Connection dbcon = dataSource.getConnection();
            JsonArray resultArray = new JsonArray();
            JsonObject resultData = new JsonObject();

            retreiveStarInfo(dbcon, starId, resultData);

            JsonArray movies = getStarMoviesAll(dbcon, starId);

            resultData.add("movies", movies);
            resultArray.add(resultData);

            out.write(resultArray.toString());
            response.setStatus(200);

            dbcon.close();
        } catch (Exception e) {
            e.printStackTrace();
            JsonObject jsonObject = new JsonObject();
            jsonObject.addProperty("errorMessage", e.getMessage());
            out.write(jsonObject.toString());

            response.setStatus(500);
        }

        out.close();
    }

    private void retreiveStarInfo(Connection dbcon, String id, JsonObject result)
            throws java.sql.SQLException {
        String query = "select * from stars where id = ?";

        PreparedStatement statement = dbcon.prepareStatement(query);
        statement.setString(1, id);
        ResultSet rs = statement.executeQuery();

        if (rs.next()) {
            result.addProperty("star_name", rs.getString("name"));
            result.addProperty("star_birthYear", rs.getString("birthYear"));
        }
    }

    private JsonArray getStarMoviesAll(Connection dbcon, String id)
            throws java.sql.SQLException {

        JsonArray result = new JsonArray();

        String query = "select * from movies where id in (select movieId from stars_in_movies as sim where sim.starId = ?)";
        PreparedStatement statement = dbcon.prepareStatement(query);
        statement.setString(1, id);
        ResultSet rs = statement.executeQuery();

        while (rs.next()) {
            JsonObject data = new JsonObject();
            data.addProperty("id", rs.getString("id"));
            data.addProperty("title", rs.getString("title"));
            result.add(data);
        }

        return result;
    }
}


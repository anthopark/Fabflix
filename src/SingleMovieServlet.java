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

@WebServlet(name = "SingleMovieServlet", urlPatterns = "/api/single-movie")
public class SingleMovieServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    // Create a dataSource which registered in web.xml
    @Resource(name = "jdbc/moviedb")
    private DataSource dataSource;

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");

        String movieId = request.getParameter("id");

        PrintWriter out = response.getWriter();

        try {

            Connection dbcon = dataSource.getConnection();
            JsonArray resultArray = new JsonArray();
            JsonObject resultData = new JsonObject();

            retrieveMovieInfo(dbcon, movieId, resultData);

            JsonArray genres = getMovieGenresAll(dbcon, movieId);
            JsonArray stars = getMovieStarsAll(dbcon, movieId);

            resultData.add("genres", genres);
            resultData.add("stars", stars);
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

    private void retrieveMovieInfo(Connection dbcon, String id, JsonObject result)
            throws java.sql.SQLException {
        String query1 = "select * from movies where id = ?";

        PreparedStatement statement = dbcon.prepareStatement(query1);
        statement.setString(1, id);
        ResultSet rs = statement.executeQuery();

        if (rs.next()) {
            result.addProperty("movie_title", rs.getString("title"));
            result.addProperty("movie_year", rs.getString("year"));
            result.addProperty("movie_director", rs.getString("director"));
        }

        String query2 = "select * from ratings where movieId = ?";
        PreparedStatement statement2 = dbcon.prepareStatement(query2);
        statement2.setString(1, id);
        ResultSet rs2 = statement2.executeQuery();

        if (rs2.next()) {
            result.addProperty("rating", rs2.getString("rating"));
        }
    }

    private JsonArray getMovieGenresAll(Connection dbcon, String id)
            throws java.sql.SQLException {

        JsonArray result = new JsonArray();

        String query = "select * from genres where id in (select genreId from genres_in_movies as gim where gim.movieId = ?)";
        PreparedStatement statement = dbcon.prepareStatement(query);
        statement.setString(1, id);
        ResultSet rs = statement.executeQuery();

        while (rs.next()) {
            JsonObject data = new JsonObject();
            data.addProperty("id", rs.getString("id"));
            data.addProperty("name", rs.getString("name"));
            result.add(data);
        }

        return result;
    }

    private JsonArray getMovieStarsAll(Connection dbcon, String id)
            throws java.sql.SQLException {

        JsonArray result = new JsonArray();

        String query = "select * from stars where id in (select starId from stars_in_movies as sim where sim.movieId = ?)";
        PreparedStatement statement = dbcon.prepareStatement(query);
        statement.setString(1, id);
        ResultSet rs = statement.executeQuery();

        while (rs.next()) {
            JsonObject data = new JsonObject();
            data.addProperty("id", rs.getString("id"));
            data.addProperty("name", rs.getString("name"));
            data.addProperty("birthYear", rs.getString("birthYear"));
            result.add(data);
        }


        return result;
    }
}
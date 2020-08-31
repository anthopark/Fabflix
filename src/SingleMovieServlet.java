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
import java.util.ArrayList;
import java.util.Arrays;

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


        JsonObject resultData = new JsonObject();

        try {
            Connection dbcon = dataSource.getConnection();
            retrieveMovieInfo(dbcon, movieId, resultData);


            ResultSet starsSet = getStarsInMovie(dbcon, movieId);
            JsonArray stars = buildJsonArrayStar(dbcon, starsSet, new ArrayList<String>(Arrays.asList("id", "name", "birthYear")));
            JsonArray genres = getMovieGenresAll(dbcon, movieId);

            resultData.add("genres", genres);
            resultData.add("stars", stars);


            out.write(resultData.toString());
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
            result.addProperty("movieTitle", rs.getString("title"));
            result.addProperty("movieYear", rs.getString("year"));
            result.addProperty("movieDirector", rs.getString("director"));
        }

        String query2 = "select * from ratings where movieId = ?";
        PreparedStatement statement2 = dbcon.prepareStatement(query2);
        statement2.setString(1, id);
        ResultSet rs2 = statement2.executeQuery();

        if (rs2.next()) {
            result.addProperty("movieRating", rs2.getString("rating"));
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

    private ResultSet getStarsInMovie(Connection dbcon, String movieId)
            throws java.sql.SQLException {
        String query = "select * from stars as s" +
                " where s.id in (select starId from stars_in_movies as sim where sim.movieId = ?)";

        PreparedStatement statement = dbcon.prepareStatement(query);
        statement.setString(1, movieId);

        return statement.executeQuery();

    }

    private JsonArray buildJsonArrayStar(Connection dbcon, ResultSet rs, ArrayList<String> properties)
            throws java.sql.SQLException {
        JsonArray resultArray = new JsonArray();

        while (rs.next()) {
            JsonObject json = new JsonObject();

            for (String prop : properties) {
                json.addProperty(prop, rs.getString(prop));
            }

            String starId = rs.getString("id");

            String query = "select count(*) as starring_num from stars_in_movies where starId = ?";

            PreparedStatement statement = dbcon.prepareStatement(query);
            statement.setString(1, starId);

            ResultSet starringNumResultSet = statement.executeQuery();
            if (starringNumResultSet.next()) {
                json.addProperty("starringNum", starringNumResultSet.getString("starring_num"));
            }

            resultArray.add(json);
        }

        return resultArray;
    }
}
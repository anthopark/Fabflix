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
import java.util.HashMap;
import java.util.Map;

@WebServlet(name = "MovieListServlet", urlPatterns = "/api/movie-list")
public class MovieListServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    // Create a dataSource which registered in web.xml
    @Resource(name = "jdbc/moviedb")
    private DataSource dataSource;

    /**
     * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
     */
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");

        PrintWriter out = response.getWriter();

        try {
            Connection dbcon = dataSource.getConnection();

            ResultSet topMoviesSet = getTopNRatedMovies(dbcon, 20);

            JsonArray jsonArray = new JsonArray();

            while (topMoviesSet.next()) {
                String movieId = topMoviesSet.getString("movieId");
                String movieRating = topMoviesSet.getString("rating");


                ResultSet theMovieSet = getMovieSet(dbcon, movieId);
                theMovieSet.next();

                String movieTitle = theMovieSet.getString("title");
                String movieYear = theMovieSet.getString("year");
                String movieDirector = theMovieSet.getString("director");

                ResultSet genresSet = getNGenresInMovie(dbcon, movieId, 3);
                ResultSet starsSet = getNStarsInMovie(dbcon, movieId, 3);

                JsonArray genres = buildJsonArray(genresSet, new ArrayList<String>(Arrays.asList("id", "name")));
                JsonArray stars = buildJsonArray(starsSet, new ArrayList<String>(Arrays.asList("id", "name", "birthYear")));

                JsonObject jsonObject = new JsonObject();
                jsonObject.addProperty("movie_id", movieId);
                jsonObject.addProperty("movie_title", movieTitle);
                jsonObject.addProperty("movie_year", movieYear);
                jsonObject.addProperty("movie_director", movieDirector);
                jsonObject.add("movie_genres", genres);
                jsonObject.add("movie_stars", stars);
                jsonObject.addProperty("rating", movieRating);

                jsonArray.add(jsonObject);

                theMovieSet.close();
                genresSet.close();
                starsSet.close();
            }


            out.write(jsonArray.toString());

            response.setStatus(200);

            topMoviesSet.close();
            dbcon.close();

        } catch (Exception e) {
            JsonObject jsonObject = new JsonObject();
            e.printStackTrace();
            jsonObject.addProperty("errorMessage", e.getMessage());
            out.write(jsonObject.toString());

            response.setStatus(500);
        }

        out.close();
    }

    private ResultSet getTopNRatedMovies(Connection dbcon, int numResult)
            throws java.sql.SQLException {
        String query = "SELECT * FROM ratings ORDER BY rating DESC LIMIT ?";

        PreparedStatement statement = null;

        statement = dbcon.prepareStatement(query);
        statement.setInt(1, numResult);
        return statement.executeQuery();

    }

    private ResultSet getNGenresInMovie(Connection dbcon, String movieId, int numResult)
            throws java.sql.SQLException {
        String query = "select * from genres where id in " +
                "(select genreId from genres_in_movies as gim where gim.movieId = ?) limit ?";

        PreparedStatement statement = null;

        statement = dbcon.prepareStatement(query);
        statement.setString(1, movieId);
        statement.setInt(2, numResult);
        return statement.executeQuery();

    }

    private ResultSet getNStarsInMovie(Connection dbcon, String movieId, int numResult)
            throws java.sql.SQLException {
        String query = "select * from stars where id in " +
                "(select starId from stars_in_movies as sim where sim.movieId = ?) limit ?";

        PreparedStatement statement = null;

        statement = dbcon.prepareStatement(query);
        statement.setString(1, movieId);
        statement.setInt(2, numResult);
        return statement.executeQuery();

    }

    private ResultSet getMovieSet(Connection dbcon, String movieId)
            throws java.sql.SQLException {
        String query = "select * from movies where id = ?";
        PreparedStatement statement = null;

        statement = dbcon.prepareStatement(query);
        statement.setString(1, movieId);
        return statement.executeQuery();

    }

    private JsonArray buildJsonArray(ResultSet rs, ArrayList<String> properties)
            throws java.sql.SQLException {
        JsonArray resultArray = new JsonArray();

        while (rs.next()) {
            JsonObject json = new JsonObject();

            for (String prop : properties) {
                json.addProperty(prop, rs.getString(prop));
            }
            resultArray.add(json);
        }

        return resultArray;
    }

}
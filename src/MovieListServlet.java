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


@WebServlet(name = "MovieListServlet", urlPatterns = "/api/movie-list")
public class MovieListServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    // Create a dataSource which registered in web.xml
    @Resource(name = "jdbc/moviedb")
    private DataSource dataSource;

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");

        PrintWriter out = response.getWriter();
        String searchQuery = request.getParameter("search-query");
        System.out.println(searchQuery);

        try {
            Connection dbcon = dataSource.getConnection();

            ResultSet movieResults = null;
            if (searchQuery != null) {
                movieResults = getSearchResult(dbcon, searchQuery);
            }

            JsonArray jsonArray = new JsonArray();

            while (movieResults.next()) {

                String movieTitle = movieResults.getString("title");
                String movieYear = movieResults.getString("year");
                String movieDirector = movieResults.getString("director");
                String movieId = movieResults.getString("id");

                ResultSet theMovieRatingSet = getMovieRating(dbcon, movieId);
                theMovieRatingSet.next();
                String movieRating = theMovieRatingSet.getString("rating");

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

                genresSet.close();
                starsSet.close();
            }


            out.write(jsonArray.toString());

            response.setStatus(200);

            movieResults.close();
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

    private ResultSet getSearchResult(Connection dbcon, String query)
            throws java.sql.SQLException {

        PreparedStatement statement = dbcon.prepareStatement(query);
        return statement.executeQuery();
    }

    private ResultSet getTopNRatedMovies(Connection dbcon, int numResult)
            throws java.sql.SQLException {
        String query = "SELECT * FROM ratings ORDER BY rating DESC LIMIT ?";

        PreparedStatement statement = dbcon.prepareStatement(query);
        statement.setInt(1, numResult);
        return statement.executeQuery();

    }

    private ResultSet getMovieRating(Connection dbcon, String movieId)
            throws java.sql.SQLException {
        String query = "SELECT * FROM ratings WHERE movieId = ?";

        PreparedStatement statement = dbcon.prepareStatement(query);
        statement.setString(1, movieId);

        return statement.executeQuery();
    }

    private ResultSet getNGenresInMovie(Connection dbcon, String movieId, int numResult)
            throws java.sql.SQLException {
        String query = "select * from genres where id in " +
                "(select genreId from genres_in_movies as gim where gim.movieId = ?) limit ?";

        PreparedStatement statement = dbcon.prepareStatement(query);
        statement.setString(1, movieId);
        statement.setInt(2, numResult);

        return statement.executeQuery();

    }

    private ResultSet getNStarsInMovie(Connection dbcon, String movieId, int numResult)
            throws java.sql.SQLException {
        String query = "select * from stars where id in " +
                "(select starId from stars_in_movies as sim where sim.movieId = ?) limit ?";

        PreparedStatement statement = dbcon.prepareStatement(query);
        statement.setString(1, movieId);
        statement.setInt(2, numResult);

        return statement.executeQuery();

    }

    private ResultSet getMovieSet(Connection dbcon, String movieId)
            throws java.sql.SQLException {
        String query = "select * from movies where id = ?";

        PreparedStatement statement = dbcon.prepareStatement(query);
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
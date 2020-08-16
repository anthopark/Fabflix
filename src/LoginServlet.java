import com.google.gson.JsonObject;
import sun.misc.IOUtils;

import javax.annotation.Resource;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.HashMap;



@WebServlet(name = "LoginServlet", urlPatterns = "/api/login")
public class LoginServlet extends HttpServlet {

    @Resource(name= "jdbc/moviedb")
    private DataSource dataSource;

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {

        String userEmail = request.getParameter("email");
        String userPassword = request.getParameter("password");

        JsonObject jsonResponse = new JsonObject();

        System.out.println(userEmail);
        System.out.println(userPassword);

        try {
            Connection dbcon = dataSource.getConnection();
            HashMap<String, String> userInfo = retrieveUser(dbcon, userEmail);

            System.out.println(userInfo.get("pw"));

            if (userInfo.size() == 1 && userInfo.get("pw").equals(userPassword)) {
                System.out.println("Login successful");
                jsonResponse.addProperty("loginStatus", "success");
                request.getSession().setAttribute("user", new User(userEmail));

            } else {
                System.out.println("Login unsuccessful");
                jsonResponse.addProperty("loginStatus", "fail");
                if (userInfo.size() == 0) {
                    // wrong email
                    jsonResponse.addProperty("message", "Invalid Email");
                } else {
                    // wrong pw
                    jsonResponse.addProperty("message", "Invalid Password");
                }
            }

            response.getWriter().write(jsonResponse.toString());
        } catch (Exception e) {
            e.printStackTrace();
            JsonObject jsonObject = new JsonObject();
            jsonObject.addProperty("errorMessage", e.getMessage());
            response.getWriter().write(jsonObject.toString());

            response.setStatus(500);
        }
    }

    private HashMap<String, String> retrieveUser(Connection dbcon, String email)
            throws java.sql.SQLException {
        HashMap<String, String> result = new HashMap<>();

        String query = "SELECT * FROM customers WHERE email = ?";
        PreparedStatement statement = dbcon.prepareStatement(query);

        statement.setString(1, email);
        ResultSet rs = statement.executeQuery();

        if (rs.next()) {
            result.put("pw",rs.getString("password"));
        }

        return result;
    }
}
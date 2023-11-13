import bcrypt from "bcrypt";

/**
 * Password Class
 * 
 * This class provides password-related functionality, including password hashing and comparison.
 * It uses the bcrypt library to securely hash and compare passwords.
 * 
 * @class Password
 */
class Password {
  private saltRounds: number = 10;

  async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}

export default Password;
